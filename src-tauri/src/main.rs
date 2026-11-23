#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    data_migration_native_lib::run()
}
