use serde::{ser::SerializeMap, Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum CommandError {
  #[error("ApiError: {message}")]
  ApiError {
    message: String
  },
  #[error("DbError: {message}")]
  DbError {
    message: String
  },
  #[error("UnknownError: {message}")]
  #[allow(dead_code)]
  UnknownError {
    message: String
  },
}

impl Serialize for CommandError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    let mut sv = serializer.serialize_map(Some(2))?;
    match *self {
      CommandError::ApiError{message: ref msg} => {
        sv.serialize_entry("type", "ApiError")?;
        sv.serialize_entry("message", msg)?;
      },
      CommandError::DbError{message: ref msg} => {
        sv.serialize_entry("type", "DbError")?;
        sv.serialize_entry("message", msg)?;
      },
      CommandError::UnknownError{message: ref msg} => {
        sv.serialize_entry("type", "UnknownError")?;
        sv.serialize_entry("message", msg)?;
      },
    }
    sv.end()
  }
}