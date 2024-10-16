use once_cell::sync::OnceCell;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;

pub struct Handle {
    pub app_handle: Arc<Mutex<Option<AppHandle>>>,
}

impl Handle {
    pub fn global() -> &'static Handle {
        static INSTANCE: OnceCell<Handle> = OnceCell::new();

        INSTANCE.get_or_init(|| Handle {
            app_handle: Arc::new(Mutex::new(None)),
        })
    }

    pub fn init(&self, app_handle: AppHandle) {
        let mut app_handle_guard = self
            .app_handle
            .lock()
            .expect("Failed to lock app handle mutex");
        *app_handle_guard = Some(app_handle);
    }
}
