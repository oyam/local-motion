// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use log::LevelFilter;
use std::env;
use std::path::PathBuf;
use tauri::Manager;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::LogTarget;

mod commands;
mod detectors;
mod error;
mod utils;
use detectors::custom_detector::CustomDetector;
use detectors::default_detector::DefaultDetector;

use ort::CPUExecutionProvider;

struct Config {
    system_tray: tauri::SystemTray,
}

fn main() {
    // let config = initialize().expect("error while initializing");
    // run_app(config);
    match home::home_dir() {
        Some(home) => match initialize() {
            Ok(config) => {
                let log_dir = home.join(".local-motion");
                match run_app(config, log_dir) {
                    Ok(_) => {}
                    Err(e) => {
                        log::error!("Error while running app: {}", e);
                        std::process::exit(1);
                    }
                }
            }
            Err(e) => {
                log::error!("Error while initializing: {}", e);
                std::process::exit(1);
            }
        },
        None => {
            log::error!("Error while setting HOME environment variable");
            std::process::exit(1);
        }
    }
}

fn initialize() -> Result<Config, error::Error> {
    ort::init()
        .with_execution_providers([CPUExecutionProvider::default().build()])
        .commit()?;
    let settings_menu = CustomMenuItem::new("settings".to_string(), "Settings");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(settings_menu)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    let config = Config { system_tray };
    Ok(config)
}

fn run_app(config: Config, log_dir: PathBuf) -> Result<(), tauri::Error> {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::Stdout, LogTarget::Folder(log_dir)])
                .level(LevelFilter::Info)
                .build(),
        )
        .on_window_event(|event| match event.event() {
            // Keep the frontend running in the background to avoid closing setting window
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().expect("failed to hide window");
                api.prevent_close();
            }
            _ => {}
        })
        .system_tray(config.system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "settings" => {
                    let window = app.get_window("settings").expect("failed to get window");
                    window.show().expect("failed to show window");
                    window.set_focus().expect("failed to focus window");
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::move_mouse,
            commands::left_click,
            commands::right_click,
            commands::middle_click,
            commands::double_left_click,
            commands::get_mouse_position,
            commands::run_default_detector,
            commands::run_custom_detector,
            commands::show_log,
        ])
        .setup(setup_handler)
        .run(tauri::generate_context!())?;
    Ok(())
}

fn setup_handler(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error + 'static>> {
    let model_path = app
        .path_resolver()
        .resolve_resource("models/yolov8n.onnx")
        .expect("failed to resolve resource dir");
    let default_detector = DefaultDetector::with_model_from_file(model_path)?;
    let custom_detector = CustomDetector::new();
    app.manage(default_detector);
    app.manage(custom_detector);
    let settings_window_or_none = app.get_window("settings");
    let main_window_or_none = app.get_window("main");
    match settings_window_or_none {
        None => {
            log::error!("Failed to get settings window when setting up the app");
            std::process::exit(1);
        }
        Some(settings_window) => match main_window_or_none {
            None => {
                log::error!("Failed to get main window when setting up the app");
                std::process::exit(1);
            }
            Some(main_window) => {
                settings_window.listen(
                    "on_motion_settings_updated",
                    move |motion_settings_event| {
                        let res_msettings_event = main_window.emit("on_motion_settings_updated", {
                            motion_settings_event.payload()
                        });
                        if let Err(e) = res_msettings_event {
                            log::error!("Failed to emit event for updating motion settings: {}", e);
                        }
                    },
                );
            }
        },
    }
    Ok(())
}
