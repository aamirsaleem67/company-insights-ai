document.getElementById('researchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const companyUrl = document.getElementById('companyUrl').value;
    const position = document.getElementById('position').value;
    const submitBtn = document.getElementById('submitBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const result = document.getElementById('result');
    const analysisContent = document.getElementById('analysisContent');

    submitBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ companyUrl, position })
        });

        const data = await response.json();

        if (response.ok) {
            analysisContent.textContent = data.analysis;
            result.classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Failed to analyze company');
        }
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        loadingIndicator.classList.add('hidden');
    }
}); 