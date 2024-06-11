function validate(input) {
  const regex = /^\d{1,3}(,\d{3})*|\d+(\.\d{0,2})?$/;
  let value = input.value.replace(/[^\d.]/g, '');
  value = value.replace(/\.{2,}/g, '.');
  value = value.replace(/\.(\d{2})\d+/g, '.$1');
  if (!regex.test(value) || (value === '.')) {
    input.value = input.value.slice(0, -1);
  } else {
    input.value = value;
  }
}

const rubInput = document.getElementById('rub');
const otherInput = document.getElementById('otherCurrencyValue');
const currencySelect = document.getElementById('otherCurrency');

rubInput.addEventListener('input', function () {
  validate(rubInput);
});

otherInput.addEventListener('input', function () {
  validate(otherInput);
});

let exchangeRates = {};

fetch('https://www.cbr.ru/scripts/XML_daily_eng.asp')
  .then(response => response.text())
  .then(data => {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let xmlData;
    try {
      xmlData = decoder.decode(encodedData);
    } catch (error) {
      const detectedEncoding = new TextDecoder().decode(encodedData);
      xmlData = detectedEncoding;
    }
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');

    const valutes = xmlDoc.getElementsByTagName('Valute');

    const options = [];

    for (let i = 0; i < valutes.length; i++) {
      const charCode = valutes[i].getElementsByTagName('CharCode')[0].textContent;
      const name = valutes[i].getElementsByTagName('Name')[0].textContent;
      const value = parseFloat(valutes[i].getElementsByTagName('Value')[0].textContent.replace(',', '.'));
      exchangeRates[charCode] = value;

      const option = document.createElement('option');
      option.value = charCode;
      option.textContent = `${charCode} (${name})`;
      options.push(option);
    }

    options.sort((a, b) => a.textContent.localeCompare(b.textContent));

    const currencySelect = document.getElementById('otherCurrency');
    for (let i = 0; i < options.length; i++) {
      currencySelect.appendChild(options[i]);
    }
  })
  
  .catch(error => {
    console.error('Error fetching XML data:', error);
  });

rubInput.addEventListener('input', function () {
  validate(rubInput);

  const rubValue = parseFloat(rubInput.value);
  const selectedCurrency = currencySelect.value;
  const exchangeRate = exchangeRates[selectedCurrency];

  if (!isNaN(rubValue) && !isNaN(exchangeRate)) {
    otherInput.value = (rubValue / exchangeRate).toFixed(2);
  } else {
    otherInput.value = '';
  }
});

currencySelect.addEventListener('change', function () {
  const rubValue = parseFloat(rubInput.value);
  const selectedCurrency = currencySelect.value;
  const exchangeRate = exchangeRates[selectedCurrency];

  if (!isNaN(rubValue) && !isNaN(exchangeRate)) {
    otherInput.value = (rubValue / exchangeRate).toFixed(2);
  } else {
    otherInput.value = '';
  }
});

otherInput.addEventListener('input', function () {
  validate(otherInput);

  const otherValue = parseFloat(otherInput.value);
  const selectedCurrency = currencySelect.value;
  const exchangeRate = exchangeRates[selectedCurrency];

  if (!isNaN(otherValue) && !isNaN(exchangeRate)) {
    rubInput.value = (otherValue * exchangeRate).toFixed(2);
  } else {
    rubInput.value = '';
  }
});
