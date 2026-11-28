# Gia operations and dependency register

Runtime: @huggingface/transformers 3.7.2 (packaged at build). Models: Xenova/all-MiniLM-L6-v2, onnx-community/Qwen2.5-0.5B-Instruct, onnx-community/whisper-tiny.en. Model revisions are not pinned yet. Verify each exact snapshot's licence and redistribution terms before institutional delivery. Do not represent this register as a completed licence audit.

Default configuration downloads model weights from Hugging Face. For isolated hosting, provision compatible model snapshots under models/<organisation>/<model>/, including tokenizer, config and ONNX weights required by the configured dtype. Record upstream revision and SHA-256 for every file. Set localModels to true in gia-model-config.json only after verifying all three models on target devices. This disables remote model retrieval. Runtime assets are packaged separately under vendor/transformers/.

GitHub Pages size and bandwidth limits may make institutional hosting preferable. Never commit patient data. Advanced AI is experimental; source extracts are authoritative only to the extent of their underlying documents. Verify original pages. Voice requires microphone permission and compatible browser hardware.

Release gate: run smoke tests, inspect index coverage, verify deployed runtime and model loading, test microphone on actual Android/iOS/desktop devices, review licences and document rollback commit. No institutional certification until these checks pass.
