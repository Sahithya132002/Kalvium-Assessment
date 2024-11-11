// public/client.js
const socket = io();
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;

const canvas = document.getElementById('pdf-render');
const ctx = canvas.getContext('2d');
const pdfUrl = '/sample.pdf';  


pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.mjs';

pdfjsLib.getDocument(pdfUrl).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.getElementById('page-num').textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
    renderPage(pageNum);
});

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        page.render(renderCtx).promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    document.getElementById('page-num').textContent = `Page ${num} of ${pdfDoc.numPages}`;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function changePage(num) {
    if (num >= 1 && num <= pdfDoc.numPages) {
        pageNum = num;
        queueRenderPage(num);
        socket.emit('changePage', pageNum);  
    }
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    changePage(--pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    changePage(++pageNum);
});

socket.on('pageChange', (page) => {
    pageNum = page;
    queueRenderPage(page);
});
