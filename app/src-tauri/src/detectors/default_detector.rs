use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageBuffer, Rgba};
use ndarray::{s, Array, ArrayBase, Axis, Dim, OwnedRepr};
use ort::{inputs, Session, SessionOutputs};
use std::path::Path;

use crate::error;
use crate::utils::image_utils;

#[rustfmt::skip]
const YOLOV8_CLASS_LABELS: [&str; 2] = ["icon", "text"];

pub struct DefaultDetector {
    model: Session,
}

impl DefaultDetector {
    pub fn with_model_from_file<P: AsRef<Path>>(path: P) -> ort::Result<Self> {
        let model = Session::builder()?.with_model_from_file(path)?;
        let default_detector = Self { model };
        Ok(default_detector)
    }

    pub fn detect(
        &self,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
        scale_facter: f32,
    ) -> Result<Vec<Vec<u64>>, error::Error> {
        let input = self.pre_processing(image);
        let outputs = self.run_model(input)?;
        let boxes = self.post_processing(image, scale_facter, outputs)?;
        Ok(boxes)
    }

    fn pre_processing(
        &self,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
    ) -> ArrayBase<OwnedRepr<f32>, Dim<[usize; 4]>> {
        let rgba = DynamicImage::ImageRgba8(image.clone());
        let img = rgba.resize_exact(512, 512, FilterType::CatmullRom);
        let mut input = Array::zeros((1, 3, 512, 512));
        for pixel in img.pixels() {
            let x = pixel.0 as _;
            let y = pixel.1 as _;
            let [r, g, b, _] = pixel.2 .0;
            input[[0, 0, y, x]] = (r as f32) / 255.;
            input[[0, 1, y, x]] = (g as f32) / 255.;
            input[[0, 2, y, x]] = (b as f32) / 255.;
        }
        input
    }

    fn run_model(&self, input: ArrayBase<OwnedRepr<f32>, Dim<[usize; 4]>>) -> ort::Result<SessionOutputs> {
        let outputs = self.model.run(inputs!["images" => input.view()]?)?;
        Ok(outputs)
    }

    fn post_processing(
        &self,
        image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
        scale_facter: f32,
        outputs: SessionOutputs,
    ) -> Result<Vec<Vec<u64>>, error::Error> {
        let output = outputs["output0"]
            .extract_tensor::<f32>()?
            .view()
            .t()
            .into_owned();

        let (img_width, img_height) = (image.width(), image.height());
        let mut boxes = Vec::new();
        let output = output.slice(s![.., .., 0]);
        for row in output.axis_iter(Axis(0)) {
            let row: Vec<_> = row.iter().copied().collect();
            let (class_id, prob) = row
                .iter()
                // skip bounding box coordinates
                .skip(4)
                .enumerate()
                .map(|(index, value)| (index, *value))
                .reduce(|accum, row| if row.1 > accum.1 { row } else { accum })
                .ok_or(error::Error::InvalidOrtOutputFormat)?;
            if prob < 0.3 {
                continue;
            }
            let label = YOLOV8_CLASS_LABELS[class_id];
            let xc = row[0] / 512. * (img_width as f32 / scale_facter);
            let yc = row[1] / 512. * (img_height as f32 / scale_facter);
            let w = row[2] / 512. * (img_width as f32 / scale_facter);
            let h = row[3] / 512. * (img_height as f32 / scale_facter);
            boxes.push((
                image_utils::BoundingBox {
                    x1: xc - w / 2.,
                    y1: yc - h / 2.,
                    x2: xc + w / 2.,
                    y2: yc + h / 2.,
                },
                label,
                prob,
            ));
        }

        boxes.sort_by(|box1, box2| box2.2.total_cmp(&box1.2));
        let mut result = Vec::new();
        let mut res: Vec<Vec<u64>> = Vec::new();

        while !boxes.is_empty() {
            result.push(boxes[0]);
            res.push(vec![
                boxes[0].0.x1 as u64,
                boxes[0].0.y1 as u64,
                boxes[0].0.x2 as u64,
                boxes[0].0.y2 as u64,
            ]);
            boxes = boxes
                .iter()
                .filter(|box1| {
                    image_utils::intersection(&boxes[0].0, &box1.0) / image_utils::union(&boxes[0].0, &box1.0) < 0.7
                })
                .copied()
                .collect();
        }

        Ok(res)
    }
}
