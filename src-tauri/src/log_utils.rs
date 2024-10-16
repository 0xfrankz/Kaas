pub fn trace<S: Into<String>>(tag: &str, message: S) {
    log::trace!("[{}]: {}", tag, message.into());
}

pub fn debug<S: Into<String>>(tag: &str, message: S) {
    log::debug!("[{}]: {}", tag, message.into());
}

pub fn info<S: Into<String>>(tag: &str, message: S) {
    log::info!("[{}]: {}", tag, message.into());
}

pub fn warn<S: Into<String>>(tag: &str, message: S) {
    log::warn!("[{}]: {}", tag, message.into());
}

pub fn error<S: Into<String>>(tag: &str, message: S) {
    log::error!("[{}]: {}", tag, message.into());
}
