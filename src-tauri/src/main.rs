#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod database;



use tauri::Manager;
use tauri::{CustomMenuItem, PhysicalPosition, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::async_runtime::block_on;

use crate::database::load_migrations;

#[cfg(target_os = "macos")]
use cocoa::appkit::{NSWindow, NSWindowButton, NSWindowStyleMask, NSWindowTitleVisibility};

#[cfg(target_os = "macos")]
use objc::runtime::YES;

use tauri::{Runtime, Window};

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;

#[cfg(dev)]
const IDENTIFIER: &str = "werpers.standle.dev";
#[cfg(not(dev))]
const IDENTIFIER: &str = "werpers.standle";

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool) {
        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;
            NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
            let mut style_mask = id.styleMask();
            style_mask.set(
                NSWindowStyleMask::NSFullSizeContentViewWindowMask,
                title_transparent,
            );

            id.setStyleMask_(style_mask);

            if remove_tool_bar {
                let close_button = id.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
                let _: () = msg_send![close_button, setHidden: YES];
                let min_button =
                    id.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
                let _: () = msg_send![min_button, setHidden: YES];
                let zoom_button = id.standardWindowButton_(NSWindowButton::NSWindowZoomButton);
                let _: () = msg_send![zoom_button, setHidden: YES];
            }

            id.setTitleVisibility_(if title_transparent {
                NSWindowTitleVisibility::NSWindowTitleHidden
            } else {
                NSWindowTitleVisibility::NSWindowTitleVisible
            });

            id.setTitlebarAppearsTransparent_(if title_transparent {
                cocoa::base::YES
            } else {
                cocoa::base::NO
            });
        }
    }
}

#[tauri::command]
fn backend_add(number: i32) -> i32 {
    // Note: these commands block the main thread and hang the UI until they return.
    // If you need to run a long-running task, use async command instead.
    println!("Backend was called with an argument: {}", number);
    number + 2
}

fn main() {

    let quit = CustomMenuItem::new("quit".to_string(), "Quit BuildLog");
    let tray_menu = SystemTrayMenu::new().add_item(quit);
    let system_tray = SystemTray::new()
        .with_menu(tray_menu)
        .with_menu_on_left_click(false);

    let mut ctx = tauri::generate_context!();
    ctx.config_mut().tauri.bundle.identifier = IDENTIFIER.to_string();



    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::LeftClick { position, size, .. } => {
                let w = app.get_window("main").unwrap();
                let visible = w.is_visible().unwrap();
                if visible {
                    w.hide().unwrap();
                } else {
                    let window_size = w.outer_size().unwrap();
                    let physical_pos = PhysicalPosition {
                        x: position.x as i32 + (size.width as i32 / 2)
                            - (window_size.width as i32 / 2),
                        y: position.y as i32 - window_size.height as i32,
                    };

                    let _ = w.set_position(tauri::Position::Physical(physical_pos));
                    w.show().unwrap();
                    w.set_focus().unwrap();
                }
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // don't kill the app when the user clicks close.
                #[cfg(not(dev))]
                event.window().hide().unwrap();
                api.prevent_close();
            }
            tauri::WindowEvent::Focused(false) => {
                #[cfg(not(dev))]
                event.window().hide().unwrap();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![backend_add])
        .plugin(tauri_plugin_sql::Builder::default().add_migrations("sqlite:standle.db", load_migrations()).build())
        .setup(|app| {
            block_on(async move {

                #[cfg(target_os = "macos")]
                // don't show on the taskbar/springboard
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);


                let window = app.get_window("main").unwrap();
                #[cfg(target_os = "macos")]
                window.set_transparent_titlebar(true, true);

                #[cfg(dev)]
                window.open_devtools();
                window.set_always_on_top(true).unwrap();

                Ok(())
           })
        })
        .build(ctx)
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        })
}
