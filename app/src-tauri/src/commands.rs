use std::thread::sleep;
use std::time::Duration;

use enigo::{Enigo, MouseButton, MouseControllable};
use screenshots::Screen;

use crate::detectors::custom_detector::CustomDetector;
use crate::detectors::default_detector::DefaultDetector;
use crate::utils::image_utils;
use crate::error;


#[tauri::command]
pub fn get_mouse_position() -> Result<(i32, i32, u32, u32), error::Error> {
    let enigo = Enigo::new();
    let (x, y) = enigo.mouse_location();
    let screen = Screen::from_point(x, y)?;
    Ok((x, y, screen.display_info.width, screen.display_info.height))
}

#[tauri::command]
pub async fn run_default_detector(
    default_detector: tauri::State<'_, DefaultDetector>,
    center_x: i32,
    center_y: i32,
    width: u16,
    height: u16,
    scale_factor: f32,
) -> Result<Vec<Vec<u64>>, error::Error> {
    let image = image_utils::capture_area(center_x, center_y, width, height)?;
    let bboxes = default_detector.detect(&image, scale_factor)?;
    Ok(bboxes)
}

#[tauri::command]
pub async fn run_custom_detector(
    custom_detector: tauri::State<'_, CustomDetector>,
    url: &str,
    center_x: i32,
    center_y: i32,
    width: u16,
    height: u16,
    scale_factor: f32,
) -> Result<Vec<Vec<f64>>, error::Error> {
    let image = image_utils::capture_area(center_x, center_y, width, height)?;
    let bboxes = custom_detector
        .detect(url, &image, scale_factor)
        .await?;
    Ok(bboxes)
}

#[tauri::command]
pub fn move_mouse(x: i32, y: i32) {
    let mut enigo = Enigo::new();
    enigo.mouse_move_to(x, y);
}

#[tauri::command]
pub fn left_click() {
    let mut enigo = Enigo::new();
    sleep(Duration::from_millis(50)); // Wait for 50ms to ensure mouse is moved
    enigo.mouse_click(MouseButton::Left);
}

#[tauri::command]
pub fn right_click() {
    let mut enigo = Enigo::new();
    sleep(Duration::from_millis(50)); // Wait for 50ms to ensure mouse is moved
    enigo.mouse_click(MouseButton::Right);
}

#[tauri::command]
pub fn middle_click() {
    let mut enigo = Enigo::new();
    sleep(Duration::from_millis(50)); // Wait for 50ms to ensure mouse is moved
    enigo.mouse_click(MouseButton::Middle);
}

#[tauri::command]
pub fn double_left_click() {
    let mut enigo = Enigo::new();
    sleep(Duration::from_millis(50)); // Wait for 50ms to ensure mouse is moved
    enigo.mouse_click(MouseButton::Left);
    enigo.mouse_click(MouseButton::Left);
}

#[tauri::command]
pub fn show_log(msg: String) {
    println!("{:?}", msg);
}
