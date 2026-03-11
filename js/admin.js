// Configuración de Supabase para el panel de administración
const SUPABASE_URL = 'https://spqttbwecnbqlfpgqrdg.supabase.co';
// ⚠️ ¡ALERTA DE SEGURIDAD! ⚠️
// Esta clave (`service_role`) otorga control total sobre tu base de datos.
// NO DEBES usarla en el código de tu tienda pública.
// Para este panel de admin, es aceptable SI Y SOLO SI este archivo (admin.html)
// se usa localmente en tu computadora y NUNCA se sube a tu hosting público.
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcXR0YndlY25icWxmcGdxcmRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE4NzQzOCwiZXhwIjoyMDg4NzYzNDM4fQ.cd_1buzo94ycomBVfvMwMgMbSCRc1I2b0gxKyVtRGy8';

const supabaseAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const form = document.getElementById('addProductForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value);
    const category = document.getElementById('category').value;
    const imageFile = document.getElementById('image').files[0];

    if (!name || !price || !stock || !category || !imageFile) {
        showNotification('Por favor, completa todos los campos.', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Subiendo...';

    try {
        // 1. Subir la imagen a Supabase Storage
        const filePath = `public/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images') // El bucket que creaste en el Paso 1
            .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // 2. Obtener la URL pública de la imagen
        const { data: urlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filePath);
        
        const imageUrl = urlData.publicUrl;

        // 3. Insertar el producto en la base de datos
        const { error: insertError } = await supabaseAdmin
            .from('products')
            .insert([{ name, price, stock, category, image_url: imageUrl, created_at: new Date() }]);

        if (insertError) throw insertError;

        showNotification('¡Producto agregado con éxito!', 'success');
        form.reset();

    } catch (error) {
        console.error('Error al agregar producto:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Agregar Producto';
    }
});

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = type;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 4000);
}

