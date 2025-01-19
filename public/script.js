document.getElementById('researchForm').addEventListener('submit', async e => {
  e.preventDefault();

  const companyUrl = document.getElementById('companyUrl').value;
  const position = document.getElementById('position').value;
  const submitBtn = document.getElementById('submitBtn');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const result = document.getElementById('result');
  const analysisContent = document.getElementById('analysisContent');

  submitBtn.disabled = true;
  document.getElementById('companyUrl').disabled = true;
  document.getElementById('position').disabled = true;
  loadingIndicator.classList.remove('hidden');
  result.classList.add('hidden');

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyUrl, position }),
    });

    const data = await response.json();

    if (response.ok) {
      analysisContent.textContent = data.analysis;
      result.classList.remove('hidden');
    } else {
      const errorMessage =
        response.status === 429
          ? 'Too many requests. Please try again in a few minutes.'
          : data.error || 'Failed to analyze company';
      throw new Error(errorMessage);
    }
  } catch (error) {
    alert(error.message);
  } finally {
    // Re-enable form inputs
    submitBtn.disabled = false;
    document.getElementById('companyUrl').disabled = false;
    document.getElementById('position').disabled = false;
    loadingIndicator.classList.add('hidden');
  }
});
