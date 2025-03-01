#![allow(deprecated)]
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use log::LevelFilter;
use std::env;
use std::path::PathBuf;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Listener, Manager};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{Target, TargetKind};

mod commands;
mod detectors;
mod error;
mod utils;
use detectors::custom_detector::CustomDetector;
use detectors::default_detector::DefaultDetector;

use ort::execution_providers::CPUExecutionProvider;

// struct Config {
//     system_tray: tauri::SystemTray,
// }

fn main() {
    // let config = initialize().expect("error while initializing");
    // run_app(config);
    match home::home_dir() {
        Some(home) => match initialize() {
            Ok(_) => {
                let log_dir = home.join(".local-motion");
                match run_app(log_dir) {
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

fn initialize() -> Result<(), error::Error> {
    ort::init()
        .with_execution_providers([CPUExecutionProvider::default().build()])
        .commit()?;
    Ok(())
}

fn run_app(log_dir: PathBuf) -> Result<(), tauri::Error> {
    println!(" ========== log_dir: {:?} ===========", log_dir);
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        // .plugin(tauri_plugin_autostart::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        // .plugin(
        //     tauri_plugin_log::Builder::new(
        //         tauri_plugin_log
        //     )
        // )
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .targets([
                    Target::new(TargetKind::Stdout),
                    // Target::new(TargetKind::LogDir {
                    //     file_name: Some("logs".to_string()),
                    // }),
                    Target::new(TargetKind::Folder {
                        path: log_dir,
                        file_name: Some("local-motion".to_string()),
                    }),
                ])
                .level(LevelFilter::Info)
                .build(),
        )
        // .on_window_event(|event| match event.event() {
        //     // Keep the frontend running in the background to avoid closing setting window
        //     tauri::WindowEvent::CloseRequested { api, .. } => {
        //         event.window().hide().expect("failed to hide window");
        //         api.prevent_close();
        //     }
        //     _ => {}
        // })
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
        .path()
        .parse("models/yolov8n.onnx")
        .expect("failed to resolve resource dir");
    let default_detector = DefaultDetector::with_model_from_file(model_path)?;
    let custom_detector = CustomDetector::new();
    app.manage(default_detector);
    app.manage(custom_detector);
    let settings_window_or_none = app.get_webview_window("settings");
    let main_window_or_none = app.get_webview_window("main");
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

    // Add tray icon

    // let settings_menu = MenuItemBuilder::with_id("settings".to_string(), "Settings").build(app)?;
    // let quit = MenuItemBuilder::with_id("quit".to_string(), "Quit").build(app)?;
    // let menu = MenuBuilder::new(app)
    //     .item(&settings_menu)
    //     .separator()
    //     .item(&quit)
    //     .build()?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&settings_item, &separator, &quit_item])?;
    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        // .menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "settings" => {
                println!("settings clicked");
                log::info!("=== log: settings clicked ===");
                let window = app
                    .get_webview_window("settings")
                    .expect("failed to get window");
                window.show().expect("failed to show window");
                window.set_focus().expect("failed to focus window");
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .icon(app.default_window_icon().unwrap().clone())
        .build(app)?;
    Ok(())
}
