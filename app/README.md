### Requirements for development
- Rust
- Node.js
- Tauri. For prerequisites for Tauri, see https://tauri.app/v1/guides/getting-started/prerequisites
- Default Detector model. Download [yolov8n.onnx](https://drive.google.com/drive/folders/1o5UHZue8TT5CCApTfM1TF0s9-b-Vsnx4?usp=drive_link) (latest model is recommended) and place it in app/src-tauri/models folder before building the app.


### Build
```
pnpm i 
pnpm tauri build
```

### Development
```
pnpm i 
pnpm tauri dev
```

### Logging
local-motion.log will be stored in .local-motion folder under your home directory. Application log will be written in the file and stdout.
If you need more detailed logging, you can use [log crates](https://crates.io/crates/log) which is set up in initialization of the app by [Tauri's logging plugin API](https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/log) on the backend, or use JavaScript API of the plugin on the frontend.
