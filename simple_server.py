from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from PIL import Image

app = FastAPI(title="Simple Decor8AI Test Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple server is running"}

@app.post("/restyle")
async def restyle_room(
    image: UploadFile = File(...),
    prompt: str = Form(...)
):
    try:
        # Create a temporary file for the input image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_input:
            content = await image.read()
            temp_input.write(content)
            temp_input_path = temp_input.name

        # Create a temporary file for the output
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_output:
            temp_output_path = temp_output.name

        # Simple processing: just copy the image with some basic enhancement
        with Image.open(temp_input_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as JPEG
            img.save(temp_output_path, 'JPEG', quality=90)

        # Clean up input file
        os.unlink(temp_input_path)

        # Return the processed image
        return FileResponse(
            temp_output_path,
            media_type="image/jpeg",
            filename="restyled_room.jpg"
        )

    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)