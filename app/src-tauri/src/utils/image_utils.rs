use image::{ImageBuffer, Rgb, Rgba};
use screenshots::Screen;

use crate::error;

#[derive(Debug, Clone, Copy)]
pub struct BoundingBox {
    pub x1: f32,
    pub y1: f32,
    pub x2: f32,
    pub y2: f32,
}

pub fn intersection(box1: &BoundingBox, box2: &BoundingBox) -> f32 {
    (box1.x2.min(box2.x2) - box1.x1.max(box2.x1)) * (box1.y2.min(box2.y2) - box1.y1.max(box2.y1))
}

pub fn union(box1: &BoundingBox, box2: &BoundingBox) -> f32 {
    ((box1.x2 - box1.x1) * (box1.y2 - box1.y1)) + ((box2.x2 - box2.x1) * (box2.y2 - box2.y1))
        - intersection(box1, box2)
}

pub fn rgba8_to_rgb8(
    input: &ImageBuffer<Rgba<u8>, Vec<u8>>,
) -> Result<ImageBuffer<Rgb<u8>, Vec<u8>>, error::Error> {
    let width = input.width() as usize;
    let height = input.height() as usize;
    let input: &Vec<u8> = input.as_raw();
    let mut output_data = vec![0u8; width * height * 3];
    let mut i = 0;
    for chunk in input.chunks(4) {
        output_data[i..i + 3].copy_from_slice(&chunk[0..3]);
        i += 3;
    }
    match image::ImageBuffer::from_raw(width as u32, height as u32, output_data) {
        Some(image) => Ok(image),
        None => Err(error::Error::ImageConversion),
    }
}

pub fn capture_area(
    center_x: i32,
    center_y: i32,
    width: u16,
    height: u16,
) -> Result<ImageBuffer<Rgba<u8>, Vec<u8>>, error::Error> {
    // let screen = Screen::from_point(center_x, center_y);
    let screen = Screen::from_point(center_x, center_y)?;
    let relative_x = center_x - screen.display_info.x;
    let relative_y = center_y - screen.display_info.y;
    let half_width = width / 2;
    let half_height = height / 2;
    let x_min = relative_x - i32::from(half_width);
    let y_min = relative_y - i32::from(half_height);
    let image = screen
        .capture_area(x_min, y_min, u32::from(width), u32::from(height))?;
    Ok(image)
}
