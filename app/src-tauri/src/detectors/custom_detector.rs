use base64::{engine::general_purpose, Engine as _};
use image::codecs::png::PngEncoder;
use image::{ColorType, ImageBuffer, ImageEncoder, Rgba};
use reqwest::Client;
use serde_json::Value;
use std::collections::HashMap;
use std::io::Cursor;

use crate::error;
use crate::utils::image_utils;

pub struct CustomDetector {
    client: Client,
}

impl CustomDetector {
    pub fn new() -> Self {
        Self { client: Client::new() }
    }

    pub async fn detect(
        &self,
        url: &str,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
        scale_factor: f32,
    ) -> Result<Vec<Vec<f64>>, error::Error> {
        let payload = self.pre_processing(image)?;
        let response = self.request(url, payload).await?;
        let boxes = self.post_processing(image, scale_factor, response)?;
        Ok(boxes)
    }

    fn pre_processing(
        &self,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
    ) -> Result<HashMap<String, String>, error::Error> {
        // let rgb = image_utils::rgba8_to_rgb8(image).ok_or("Failed to convert rgba8 to rgb8")?;
        let rgb = image_utils::rgba8_to_rgb8(image)?;
        let mut img_bytes = Vec::new();
        let encoder = PngEncoder::new(Cursor::new(&mut img_bytes));
        encoder.write_image(&rgb, rgb.width(), rgb.height(), ColorType::Rgb8)?;
        let img_base64 = general_purpose::URL_SAFE.encode(&img_bytes);
        // let img_base64_str = img_base64.as_str();
        //   let scale_factor_str = scale_factor.to_string();
        let mut payload = HashMap::new();
        payload.insert("image_data".to_string(), img_base64);
        Ok(payload)
    }

    async fn request(
        &self,
        url: &str,
        payload: HashMap<String, String>,
    ) -> Result<Value, error::Error> {
        let response = self
            .client
            .post(url)
            .json(&payload)
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;
        Ok(response)
    }

    fn post_processing(
        &self,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
        scale_factor: f32,
        response: Value,
    ) -> Result<Vec<Vec<f64>>, error::Error> {
        let (img_width, img_height) = (image.width(), image.height());
        let boxes_key = String::from("boxes");
        let box_values = response.get(&boxes_key).ok_or(error::Error::BoxesFieldNotFound)?;
        let mut converted_boxes: Vec<Vec<f64>> = Vec::new();
        if let Some(boxes) = box_values.as_array() {
            for bbox in boxes {
                if let Some(coords) = bbox.as_array() {
                    //   if let Some(new_bbox) = coords.iter().map(|x| x.as_u64()).collect() {
                    //       converted_boxes.push(new_bbox);
                    //   }
                    let new_bbox: Option<Vec<f64>> = coords.iter().map(|x| x.as_f64()).collect();
                    match new_bbox {
                        Some(mut new_bbox) => {
                            for i in 0..4 {
                                let mut new_bbox_i = new_bbox[i];
                                if i % 2 == 0 {
                                    new_bbox_i =
                                        new_bbox_i * f64::from(img_width) / f64::from(scale_factor);
                                } else {
                                    new_bbox_i = new_bbox_i * f64::from(img_height)
                                        / f64::from(scale_factor);
                                }
                                new_bbox[i] = new_bbox_i;
                            }
                            converted_boxes.push(new_bbox);
                        }
                        None => (),
                    }
                }
            }
        }
        Ok(converted_boxes)
    }

}
