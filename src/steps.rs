use anyhow::{anyhow, Result};
use std::{
    convert::TryInto,
    fs::{self, File},
    io::{Read, Write},
    path::{Path, PathBuf},
    process::Command,
};

//#region Constants
const CLIENT_OUT_DIR: &str = "client/src/backend/wasm";
const OUT_DIR: &str = "server/build";
const MOD_DIR: &str = "server/worker";
const OUT_NAME: &str = "engine";
const TYPES_DIR: &str = "types";
const CLIENT_TYPES_DIR: &str = "client/src/types";
//#endregion

//#region Client build
pub fn client_wasm_pack_build() -> Result<()> {
    let result = Command::new("wasm-pack")
        .arg("build")
        .args(&["--target", "web"])
        .args(&["--out-dir", CLIENT_OUT_DIR])
        .arg("--release")
        .arg("--")
        .args(&["--features", "client"])
        .spawn()?
        .wait()?;

    match result.success() {
        true => Ok(()),
        false => Err(anyhow!("wasm-pack exited with status {}", result)),
    }
}

pub fn client_delete_gitignore() -> Result<()> {
    let gitignore_path = PathBuf::from(CLIENT_OUT_DIR).join(".gitignore");
    if gitignore_path.exists() {
        fs::remove_file(gitignore_path)?;
    }
    Ok(())
}
//#endregion

//#region Server build
pub fn server_wasm_pack_build() -> Result<()> {
    let status = Command::new("wasm-pack")
        .arg("build")
        .args(&["--out-dir", OUT_DIR])
        .args(&["--out-name", OUT_NAME])
        .arg("--release")
        .arg("--")
        .args(&["--features", "server"])
        .spawn()?
        .wait()?;

    match status.success() {
        true => Ok(()),
        false => Err(anyhow!("wasm-pack exited with status {}", status)),
    }
}

pub fn server_copy_generated_code_to_worker_dir() -> Result<()> {
    let glue_src = PathBuf::from(OUT_DIR).join(format!("{}_bg.js", OUT_NAME));
    let glue_dest = PathBuf::from(MOD_DIR).join(format!("{}_bg.mjs", OUT_NAME));

    let wasm_src = PathBuf::from(OUT_DIR).join(format!("{}_bg.wasm", OUT_NAME));
    let wasm_dest = PathBuf::from(MOD_DIR).join(format!("{}_bg.wasm", OUT_NAME));

    let types_src = PathBuf::from(OUT_DIR).join(format!("{}.d.ts", OUT_NAME));
    let types_dest = PathBuf::from(MOD_DIR).join(format!("{}_bg.mjs.d.ts", OUT_NAME));

    for (src, dest) in [
        (glue_src, glue_dest),
        (wasm_src, wasm_dest),
        (types_src, types_dest),
    ] {
        if src.exists() {
            fs::rename(src, dest)?;
        }
    }

    Ok(())
}

pub fn server_write_worker_shim_to_worker_dir() -> Result<()> {
    let bg_name = format!("{}_bg", OUT_NAME);

    // this shim exports a webassembly instance with 512 pages
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Memory/Memory#parameters
    let export_wasm_content = format!(
        r#"
import * as {0} from "./{0}.mjs";
import _wasm from "./{0}.wasm";
const _wasm_memory = new WebAssembly.Memory({{initial: 512}});
let importsObject = {{
    env: {{ memory: _wasm_memory }},
    "./{0}.js": {0}
}};
export default new WebAssembly.Instance(_wasm, importsObject).exports;
"#,
        bg_name
    );
    let export_wasm_path = PathBuf::from(MOD_DIR).join("export_wasm.mjs");

    // write our content out to files
    let mut file = File::create(export_wasm_path)?;
    file.write_all(export_wasm_content.as_bytes())?;

    Ok(())
}

pub fn server_replace_generated_import_with_custom_impl() -> Result<()> {
    let bindgen_glue_path = PathBuf::from(MOD_DIR).join(format!("{}_bg.mjs", OUT_NAME));
    let old_bindgen_glue = read_file_to_string(&bindgen_glue_path)?;
    let old_import = format!("import * as wasm from './{}_bg.wasm'", OUT_NAME);
    let fixed_bindgen_glue =
        old_bindgen_glue.replace(&old_import, "import wasm from './export_wasm.mjs'");
    write_string_to_file(bindgen_glue_path, fixed_bindgen_glue)?;
    Ok(())
}
//#endregion

//#region Helper functions
pub fn read_file_to_string<P: AsRef<Path>>(path: P) -> Result<String> {
    let file_size = path.as_ref().metadata()?.len().try_into()?;
    let mut file = File::open(path)?;
    let mut buf = Vec::with_capacity(file_size);
    file.read_to_end(&mut buf)?;
    String::from_utf8(buf).map_err(anyhow::Error::from)
}

pub fn write_string_to_file<P: AsRef<Path>>(path: P, contents: String) -> Result<()> {
    let mut file = File::create(path)?;
    file.write_all(contents.as_bytes())?;

    Ok(())
}
//#endregion

pub fn copy_types() -> Result<()> {
    let messages_src = PathBuf::from(TYPES_DIR).join("messages.ts");
    let client_messages_dst = PathBuf::from(CLIENT_TYPES_DIR).join("messages.ts");
    let server_messages_dst = PathBuf::from(MOD_DIR).join("messages.mjs.ts");

    for (src, dst) in [
        (&messages_src, client_messages_dst),
        (&messages_src, server_messages_dst),
    ] {
        if src.exists() {
            fs::copy(src, dst)?;
        }
    }
    Ok(())
}

pub fn test_wasm() -> Result<()> {
    let result = Command::new("wasm-pack")
        .arg("test")
        .arg("--headless")
        .arg("--chrome")
        .arg("--firefox")
        .args(&["--features", "client, server"])
        .spawn()?
        .wait()?;

    match result.success() {
        true => Ok(()),
        false => Err(anyhow!("wasm-pack exited with status {}", result)),
    }
}
