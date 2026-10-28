import os
import sys
from PIL import Image

# Ensure utf-8 stdout
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def optimize_media(media_dir):
    total_before = 0
    total_after = 0
    optimized_count = 0

    files = [f for f in os.listdir(media_dir) if os.path.isfile(os.path.join(media_dir, f))]
    
    for f in sorted(files):
        ext = os.path.splitext(f)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            continue
            
        filepath = os.path.join(media_dir, f)
        orig_size = os.path.getsize(filepath)
        total_before += orig_size
        
        try:
            with Image.open(filepath) as img:
                width, height = img.size
                
                # Determine max bounds
                is_logo = 'logo' in f.lower() or 'capa' in f.lower()
                max_dim = 1200 if is_logo else 1920
                
                needs_resize = width > max_dim or height > max_dim
                
                # Clone/copy image to process
                processed = img.copy()
                
                if needs_resize:
                    processed.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                
                temp_path = filepath + '.tmp'
                
                if ext in ['.jpg', '.jpeg']:
                    if processed.mode in ('RGBA', 'P', 'LA'):
                        bg = Image.new('RGB', processed.size, (255, 255, 255))
                        if processed.mode == 'RGBA':
                            bg.paste(processed, mask=processed.split()[3])
                        else:
                            bg.paste(processed)
                        processed = bg
                    elif processed.mode != 'RGB':
                        processed = processed.convert('RGB')
                        
                    processed.save(temp_path, format='JPEG', quality=84, optimize=True, progressive=True)
                elif ext == '.png':
                    # Only optimize PNG if size > 150KB
                    if orig_size > 150 * 1024:
                        processed.save(temp_path, format='PNG', optimize=True)
                    else:
                        temp_path = None
                
                if temp_path and os.path.exists(temp_path):
                    new_size = os.path.getsize(temp_path)
                    if new_size < orig_size:
                        os.replace(temp_path, filepath)
                        total_after += new_size
                        optimized_count += 1
                        saved_kb = (orig_size - new_size) / 1024
                        pct = ((orig_size - new_size) / orig_size) * 100
                        print(f"[OK] {f}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (-{saved_kb:.1f} KB, -{pct:.1f}%)")
                    else:
                        os.remove(temp_path)
                        total_after += orig_size
                        print(f"[-] {f}: Mantido original ({orig_size/1024:.1f} KB)")
                else:
                    total_after += orig_size
                    print(f"[-] {f}: Mantido original ({orig_size/1024:.1f} KB)")
                    
        except Exception as e:
            print(f"[ERRO] {f}: {e}")
            total_after += orig_size

    print("\n" + "="*50)
    print(f"Total antes:  {total_before / 1024 / 1024:.2f} MB")
    print(f"Total depois: {total_after / 1024 / 1024:.2f} MB")
    saved_mb = (total_before - total_after) / 1024 / 1024
    saved_pct = ((total_before - total_after) / total_before) * 100 if total_before else 0
    print(f"Economia:     {saved_mb:.2f} MB ({saved_pct:.1f}%) em {optimized_count} arquivos!")
    print("="*50)

if __name__ == '__main__':
    optimize_media('public/assets/media')
