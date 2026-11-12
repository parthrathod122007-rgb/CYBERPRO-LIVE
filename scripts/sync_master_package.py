import os
import shutil
import hashlib

SRC_DIR = r"C:\Users\Parth\.gemini\antigravity\scratch\cyberpro"
DST_DIR = r"C:\Users\Parth\Downloads\CYBERPRO_COMPLETE_MASTER_PACKAGE\CYBERPRO_MASTER"

files_to_sync = [
    os.path.join("public", "index.html"),
    os.path.join("public", "staff-login.html"),
    os.path.join("public", "shipping-policy", "index.html"),
    os.path.join("public", "assets", "motion.js"),
    os.path.join("private", "lms.html"),
    os.path.join("public", "contact.html"),
    os.path.join("public", "contact", "index.html"),
    os.path.join("data", "cyberpro_knowledge.json"),
    os.path.join("public", "assets", "cyber-world-map.png"),
    os.path.join("public", "assets", "cyberpro-shield-sprite.png"),
    os.path.join("public", "assets", "india-polygon.json"),
    os.path.join("data", "countries.geo.json"),
    os.path.join("public", "assets", "cyber-chatbot.css"),
    os.path.join("public", "assets", "cyber-chatbot.js"),
    os.path.join("public", "about.html"),
    os.path.join("public", "about", "index.html"),
    os.path.join("public", "programs.html"),
    os.path.join("public", "programs", "index.html"),
    os.path.join("public", "ccce.html"),
    os.path.join("public", "ccce", "index.html"),
    os.path.join("public", "site-pages.css"),
    os.path.join("public", "assets", "cyber-mask-hero.mp4"),
    os.path.join("public", "assets", "cyber-mask-poster.jpg"),
    os.path.join("public", "assets", "cyber-interactions.css"),
    os.path.join("public", "assets", "cyber-interactions.js"),
    os.path.join("public", "assets", "cyber-spheres-mid-bg.mp4"),
    os.path.join("public", "assets", "cyber-spheres-mid-poster.jpg"),
    os.path.join("public", "assets", "cyber-webgl-universe.css"),
    os.path.join("public", "assets", "cyber-webgl-universe.js"),
    os.path.join("public", "assets", "vendor", "lenis.min.js"),
    os.path.join("public", "assets", "three", "ShaderPass.js"),
    os.path.join("public", "assets", "three", "MaskPass.js"),
    os.path.join("public", "assets", "shaders", "CopyShader.js"),
    os.path.join("public", "assets", "shaders", "LuminosityHighPassShader.js"),
    os.path.join("public", "assets", "cyber-why-code-bg.mp4"),
    os.path.join("public", "assets", "cyber-why-code-poster.jpg"),
    os.path.join("public", "assets", "cyber-admissions-hands-bg.mp4"),
    os.path.join("public", "assets", "cyber-admissions-hands-poster.jpg"),
    os.path.join("public", "assets", "cyber-desk2-folder-bg.mp4"),
    os.path.join("public", "assets", "cyber-desk2-folder-poster.jpg"),
    os.path.join("public", "assets", "cyber-lms-ai-showcase.mp4"),
    os.path.join("public", "assets", "cyber-lms-ai-showcase-poster.jpg"),
    os.path.join("public", "assets", "cyber-ai-launcher-mask.mp4"),
    os.path.join("public", "assets", "cyber-ai-launcher-poster.jpg"),
    os.path.join("public", "assets", "logo-mark-transparent.png"),
    os.path.join("public", "assets", "cyber-earth-surface.jpg"),
    os.path.join("public", "assets", "cyber-earth-specular.png"),
    os.path.join("public", "assets", "cyber-earth-bump.png"),
    os.path.join("public", "assets", "cyber-earth-clouds.png"),
    os.path.join("chatbot_service.py"),
    os.path.join("universal_ai_engine.py"),
    os.path.join("server.py"),
]

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

print("Synchronizing files to master package...")
all_match = True

for rel in files_to_sync:
    src_file = os.path.join(SRC_DIR, rel)
    dst_file = os.path.join(DST_DIR, rel)
    if not os.path.exists(src_file):
        continue
    os.makedirs(os.path.dirname(dst_file), exist_ok=True)
    shutil.copy2(src_file, dst_file)

    src_hash = sha256_file(src_file)
    dst_hash = sha256_file(dst_file)

    if src_hash == dst_hash:
        print(f"MATCH [OK]: {rel} -> {src_hash[:12]}...")
    else:
        print(f"MISMATCH [ERROR]: {rel}")
        all_match = False

if all_match:
    print("\n100% SHA256 PARITY CONFIRMED ACROSS ALL MASTER PACKAGE ASSETS!")
else:
    print("\nPARITY CHECK FAILED!")
