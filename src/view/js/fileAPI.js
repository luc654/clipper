async function uploadFile() {
    const fileInput = document.getElementById('import-chat');
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file.');
    
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch(`http://${ip}/api/import`, { method: 'POST', body: formData });
        const result = await response.json();
        console.log('File content:', result.content);
        alert('File uploaded successfully!');
        e.preventDefault();
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}
