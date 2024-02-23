#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    #[error(transparent)]
    Ort(#[from] ort::Error),

    #[error(transparent)]
    Image(#[from] image::error::ImageError),

    #[error(transparent)]
    Tauri(#[from] tauri::Error),

    #[error(transparent)]
    Reqwest(#[from] reqwest::Error),

    #[error(transparent)]
    Anyhow(#[from] anyhow::Error),

    #[error("Failed to convert image")]
    ImageConversion,

    #[error("boxes field not found in response")]
    BoxesFieldNotFound,

    #[error("output format of the ort model is invalid")]
    InvalidOrtOutputFormat,
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
