let jsonData = [];

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        jsonData = data;
    })
    .catch(error => {
        console.error("JSON verisi yüklenirken hata oluştu:", error);
    });

// Arama işlevi
function searchDictionary(term) {
    if (!term.trim()) {
        displayResults([]);
        return;
    }

    term = term.toLowerCase();

    const exactMatches = jsonData.filter(item =>
        item.traditional.toLowerCase() === term ||
        item.simplified.toLowerCase() === term ||
        item.pinyin.toLowerCase() === term ||
        item.definitions.some(def => def.toLowerCase() === term)
    );

    const partialMatches = jsonData.filter(item =>
        (item.traditional.toLowerCase().includes(term) ||
        item.simplified.toLowerCase().includes(term) ||
        item.pinyin.toLowerCase().includes(term) ||
        item.definitions.some(def => def.toLowerCase().includes(term))) &&
        !exactMatches.includes(item)
    );

    // Sonuçları sıralama: En yakın eşleşmeler önce
    const sortedResults = [...exactMatches, ...partialMatches].sort((a, b) => {
        const aIndex = getMatchIndex(a, term);
        const bIndex = getMatchIndex(b, term);

        return aIndex - bIndex;
    });

    displayResults(sortedResults);
}

function getMatchIndex(item, term) {
    const traditionalIndex = item.traditional.toLowerCase().indexOf(term);
    const simplifiedIndex = item.simplified.toLowerCase().indexOf(term);
    const pinyinIndex = item.pinyin.toLowerCase().indexOf(term);

    const definitionIndex = Math.min(
        ...item.definitions.map(def => def.toLowerCase().indexOf(term)).filter(idx => idx !== -1)
    );

    const indices = [traditionalIndex, simplifiedIndex, pinyinIndex, definitionIndex].filter(idx => idx !== -1);
    return indices.length > 0 ? Math.min(...indices) : Infinity; // Hiç eşleşme yoksa sonsuz değer döndür
}

// Sonuçları görüntüle
function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Sonuç bulunamadı.</p>';
        return;
    }

    const limitedResults = results.slice(0, 10); 

    limitedResults.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const traditional = document.createElement('div');
        traditional.textContent = `Traditional: ${item.traditional}`;
        resultItem.appendChild(traditional);

        const simplified = document.createElement('div');
        simplified.textContent = `Simplified: ${item.simplified}`;
        resultItem.appendChild(simplified);

        const pinyin = document.createElement('div');
        pinyin.textContent = `Pinyin: ${item.pinyin}`;
        resultItem.appendChild(pinyin);

        const definitions = document.createElement('div');
        definitions.textContent = `Definitions: ${item.definitions.join('; ')}`;
        resultItem.appendChild(definitions);

        resultsContainer.appendChild(resultItem);
    });
}
document.getElementById('search-box').addEventListener('input', (event) => {
    searchDictionary(event.target.value);
});

