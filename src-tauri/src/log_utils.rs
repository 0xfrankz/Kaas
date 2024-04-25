pub fn trace(tag: &str, message: &str) {
    log::trace!("[{}]: {}", tag, message);
}

pub fn debug(tag: &str, message: &str) {
    log::debug!("[{}]: {}", tag, message);
}

pub fn info(tag: &str, message: &str) {
    log::info!("[{}]: {}", tag, message);
}

pub fn warn(tag: &str, message: &str) {
    log::warn!("[{}]: {}", tag, message);
}

pub fn error(tag: &str, message: &str) {
    log::error!("[{}]: {}", tag, message);
}