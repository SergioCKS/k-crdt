//! # WASM build script
//!
//! Compiles the Rust code using wasm-pack and sets up the necessary files and shims for the
//! WASM module to be accessible inside the client node code.
//!
//! Based on [worker-build](https://github.com/cloudflare/workers-rs/tree/main/worker-build).
//!
//! ### Usage
//!
//! ```shell
//! cargo run build-wasm
//! ```
use std::{
   process::Command,
   // io::{Read, Write},
   // path::{Path, PathBuf},
   // fs::{self, File},
   // convert::TryInto
};
use anyhow::{anyhow, Result};

//#region Constants
const OUT_DIR: &str = "src/backend/wasm";
// const OUT_NAME: &str = "index";
// const MOD_DIR: &str = "wasm";
//#endregion

fn main() -> Result<()> {
   wasm_pack_build()?;
   // copy_generated_code_to_worker_dir()?;
   // write_worker_shim_to_worker_dir()?;
   // replace_generated_import_with_custom_impl()?;
   Ok(())
}

fn wasm_pack_build() -> Result<()> {
   let exit_status = Command::new("wasm-pack")
       .arg("build")
       .args(&["--target", "web"])
       .args(&["--out-dir", OUT_DIR])
       .arg("--release")
       .spawn()?
       .wait()?;

   match exit_status.success() {
      true => Ok(()),
      false => Err(anyhow!("wasm-pack exited with status {}", exit_status)),
   }
}

// fn copy_generated_code_to_worker_dir() -> Result<()> {
//    let glue_src = PathBuf::from(OUT_DIR).join(format!("{}_bg.js", OUT_NAME));
//    let glue_dest = PathBuf::from(MOD_DIR).join(format!("{}_bg.mjs", OUT_NAME));
//
//    let wasm_src = PathBuf::from(OUT_DIR).join(format!("{}_bg.wasm", OUT_NAME));
//    let wasm_dest = PathBuf::from(MOD_DIR).join(format!("{}_bg.wasm", OUT_NAME));
//
//    for (src, dest) in [(glue_src, glue_dest), (wasm_src, wasm_dest)] {
//       fs::rename(src, dest)?;
//    }
//
//    Ok(())
// }
//
// fn write_worker_shim_to_worker_dir() -> Result<()> {
//    let bg_name = format!("{}_bg", OUT_NAME);
//
//    // this shim exports a webassembly instance with 512 pages
//    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory/Memory#parameters
//    let export_wasm_content = format!(
//       r#"
// import * as {0} from "./{0}.mjs";
// import _wasm from "./{0}.wasm";
// const _wasm_memory = new WebAssembly.Memory({{initial: 512}});
// let importsObject = {{
//     env: {{ memory: _wasm_memory }},
//     "./{0}.js": {0}
// }};
// export default new WebAssembly.Instance(_wasm, importsObject).exports;
// "#,
//       bg_name
//    );
//    let export_wasm_path = PathBuf::from(MOD_DIR)
//        .join("export_wasm.mjs");
//
//    // write our content out to files
//    let mut file = File::create(export_wasm_path)?;
//    file.write_all(export_wasm_content.as_bytes())?;
//
//    Ok(())
// }
//
// fn replace_generated_import_with_custom_impl() -> Result<()> {
//    let bindgen_glue_path = PathBuf::from(MOD_DIR)
//        .join(format!("{}_bg.mjs", OUT_NAME));
//    let old_bindgen_glue = read_file_to_string(&bindgen_glue_path)?;
//    let old_import = format!("import * as wasm from './{}_bg.wasm'", OUT_NAME);
//    let fixed_bindgen_glue =
//        old_bindgen_glue.replace(&old_import, "import wasm from './export_wasm.mjs'");
//    write_string_to_file(bindgen_glue_path, fixed_bindgen_glue)?;
//    Ok(())
// }
//
// fn read_file_to_string<P: AsRef<Path>>(path: P) -> Result<String> {
//    let file_size = path.as_ref().metadata()?.len().try_into()?;
//    let mut file = File::open(path)?;
//    let mut buf = Vec::with_capacity(file_size);
//    file.read_to_end(&mut buf)?;
//    String::from_utf8(buf).map_err(anyhow::Error::from)
// }
//
// fn write_string_to_file<P: AsRef<Path>>(path: P, contents: String) -> Result<()> {
//    let mut file = File::create(path)?;
//    file.write_all(contents.as_bytes())?;
//
//    Ok(())
// }
