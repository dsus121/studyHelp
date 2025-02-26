document.addEventListener('DOMContentLoaded', (event) => {
    let qaArray = [];
    let importedFilename = '';

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const files = event.target.files;
        const readers = [];

        function processFile(content) {
            const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length === 3) {
                    const keyword = parts[0].trim();
                    const question = parts[1].trim();
                    const answer = parts[2].trim();
                    qaArray.push({ keyword, question, answer });
                }
            });
        }

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            readers.push(reader);

            reader.onload = function(e) {
                processFile(e.target.result);
                if (readers.every(r => r.readyState === FileReader.DONE)) {
                    importedFilename = files[i].name.split('.').slice(0, -1).join('.');
                    document.title = `Keywords, Questions, and Answers - ${importedFilename}`;
                    displayQATable(qaArray);
                }
            };

            reader.readAsText(files[i]);
        }
    });

    document.getElementById('saveButtonColor').addEventListener('click', function() {
        saveToPDF('color');
    });

    document.getElementById('saveButtonGrayscale').addEventListener('click', function() {
        saveToPDF('grayscale');
    });

    function displayQATable(qaArray) {
        const tbody = document.getElementById('qaTable').querySelector('tbody');
        tbody.innerHTML = '';  

        qaArray.forEach(item => {
            const row = document.createElement('tr');

            const keywordCell = document.createElement('td');
            keywordCell.textContent = item.keyword;
            row.appendChild(keywordCell);

            const questionCell = document.createElement('td');
            questionCell.textContent = item.question;
            row.appendChild(questionCell);

            const answerCell = document.createElement('td');
            answerCell.textContent = item.answer;
            row.appendChild(answerCell);

            tbody.appendChild(row);
        });

        console.log('Table updated'); 
    }

    // Function to save the table data to a PDF file
    function saveToPDF(mode) {
        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();
        doc.text(`Question/Answer Keywords - ${importedFilename}`, 10, 10);

        // Preparing the rows for the PDF table
        const rows = qaArray.map(item => [item.keyword, item.question, item.answer]);

        const colorStyles = {
            fillColor: [205, 175, 149], // Mocha Mousse background
            textColor: [0, 0, 0], // Black text
            lineColor: [0, 0, 0], // Black border
            lineWidth: 0.1,
        };

        const grayscaleStyles = {
            fillColor: [255, 255, 255], // White background
            textColor: [0, 0, 0], // Black text
            lineColor: [0, 0, 0], // Black border
            lineWidth: 0.1,
        };

        const styles = mode === 'color' ? colorStyles : grayscaleStyles;

        doc.autoTable({
            head: [['Keyword', 'Question', 'Answer']],
            body: rows,
            startY: 20,
            styles: styles,
            headStyles: styles,
            alternateRowStyles: mode === 'color' ? { fillColor: [230, 210, 190] } : {},
        });

        const filename = `${importedFilename}_${mode}.pdf`;
        doc.save(filename);
    }
});
