// --- Constants & Configuration ---
const CUSTOM_FONT_NAME = 'FranklinGothicDemi'; // Verify this matches jsPDFAPI.addFont(...)
const FALLBACK_FONT_NAME = 'Helvetica';
const MAX_TOTAL_STICKERS = 21;
const LABELS_PER_PAGE = 21; // 3 cols * 7 rows

// PDF Dimensions and Layout (mm)
const PAGE_WIDTH_MM = 145;
const PAGE_HEIGHT_MM = 225;
const LABEL_WIDTH_MM = 45.997;
const LABEL_HEIGHT_MM = 29.438;
const INNER_BOX_WIDTH_MM = 13.121;
const INNER_BOX_HEIGHT_MM = 11.1488;
const COLS = 3;
const ROWS = 7;
const GRID_WIDTH_MM = COLS * LABEL_WIDTH_MM;
const GRID_HEIGHT_MM = ROWS * LABEL_HEIGHT_MM;
const MARGIN_X_MM = (PAGE_WIDTH_MM - GRID_WIDTH_MM) / 2;
const MARGIN_Y_MM = (PAGE_HEIGHT_MM - GRID_HEIGHT_MM) / 2;

// Text Positioning & Styling
const TEXT_PADDING_MM = 2.5;
const PRODUCT_NAME_Y_OFFSET_MM = 7.0;
const BATCH_NO_Y_OFFSET_MM = 14.5;
const QTY_LINE_Y_OFFSET_MM = 20.0;
const MFG_DATE_Y_OFFSET_MM = 26.5;
const INNER_BOX_Y_OFFSET_MM = 9.5;
const INNER_BOX_RIGHT_MARGIN_MM = 2.5;
const FONT_SIZE_PRODUCT_NAME = 27;
const FONT_SIZE_WEIGHT_VOL = 14;
const FONT_SIZE_BATCH_LABEL = 14.83;
const FONT_SIZE_BATCH_VALUE = 14.83;
const FONT_SIZE_QTY_LABEL = 18.88;
const FONT_SIZE_QTY_VALUE = 18.88;
const FONT_SIZE_QTY_UNIT = 11.57;
const FONT_SIZE_MFG_LABEL = 18.88;
const FONT_SIZE_MFG_VALUE = 18.88;
const QTY_VALUE_NOS_GAP_MM = 0.5;

// --- DOM Elements ---
const labelForm = document.getElementById('labelForm');
const productNameInput = document.getElementById('productName');
const batchNumberInput = document.getElementById('batchNumber');
const quantityInBoxInput = document.getElementById('quantityInBox');
const mfgDateInput = document.getElementById('mfgDate');
const numberOfStickersInput = document.getElementById('numberOfStickers');
const addToArrayButton = document.getElementById('addToQueueButton'); // Button id remains for HTML, but variable is now addToArrayButton
const generateAllButton = document.getElementById('generateAllButton');
const labelArrayList = document.getElementById('labelQueueList');
const emptyArrayMessage = document.querySelector('.empty-queue-message');
const arrayStatusSpan = document.getElementById('queueStatus');

// Auto uppercase conversion for input fields
const autoUppercaseInputs = [productNameInput, batchNumberInput, mfgDateInput];
autoUppercaseInputs.forEach(input => {
    if (input) {
        input.addEventListener('input', function(e) {
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.toUpperCase();
            this.setSelectionRange(start, end);
        });
    }
});
const currentYearSpan = document.getElementById('currentYear');

// Modal DOM Elements
const modal = document.getElementById('notificationModal');
const modalContentContainer = document.getElementById('modalContentContainer');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCloseButton = document.getElementById('modalCloseButton');

// --- State ---
let labelArray = []; // Array of {id, productName, batchNumber, ..., numberOfStickers}

// --- SVG Icons for Buttons (as strings) ---
const LOADER_ICON_SVG = `<svg class="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
const ADD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
const GENERATE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

// --- Helper Functions ---
function showCustomModal(title, messageContent, isError = false, hideOkButton = false) {
    // Only use modal for confirmation dialogs (when hideOkButton is true)
    if (!hideOkButton) {
        // For all other cases, use toast instead
        let msg = '';
        if (typeof messageContent === 'string') {
            msg = messageContent;
        } else if (Array.isArray(messageContent)) {
            msg = messageContent.join('<br>');
        } else if (messageContent && messageContent.textContent) {
            msg = messageContent.textContent;
        } else {
            msg = String(messageContent);
        }
        showToast(msg);
        return;
    }
    // Always reset OK button visibility at the start
    modalCloseButton.style.display = hideOkButton ? 'none' : '';
    modalTitle.textContent = title;
    if (typeof messageContent === 'string') {
        modalMessage.innerHTML = messageContent;
    } else {
        modalMessage.innerHTML = '';
        if (Array.isArray(messageContent)) {
            const ul = document.createElement('ul');
            ul.className = 'list-disc pl-5 mt-2 space-y-1';
            messageContent.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                ul.appendChild(li);
            });
            modalMessage.appendChild(ul);
        } else {
            modalMessage.appendChild(messageContent);
        }
    }
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modalContentContainer.classList.remove('scale-95', 'opacity-0');
        modalContentContainer.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideCustomModal() {
    modalContentContainer.classList.remove('scale-100', 'opacity-100');
    modalContentContainer.classList.add('scale-95', 'opacity-0');
    modal.classList.remove('opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function calculateTotalStickersInArray() {
    return labelArray.reduce((sum, item) => sum + Number(item.numberOfStickers || 0), 0);
}

function updateArrayDisplayAndButtonStates() {
    labelArrayList.innerHTML = ''; // Clear existing items
    const totalStickers = calculateTotalStickersInArray();

    if (labelArray.length === 0) {
        // Always show the empty array message
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-queue-message text-muted-foreground text-center py-10';
        emptyMsg.textContent = 'Array is empty. Add labels using the form.';
        labelArrayList.appendChild(emptyMsg);
        generateAllButton.disabled = true;
    } else {
        if (emptyArrayMessage) emptyArrayMessage.style.display = 'none';
        generateAllButton.disabled = false;
        labelArray.forEach(item => {
            const div = document.createElement('div');
            div.className = `
                bg-white border border-gray-200 shadow-lg rounded-xl mb-6 px-6 py-5
                flex flex-col gap-2
                transition-all
                hover:shadow-xl
            `.replace(/\s+/g, ' ');
            div.innerHTML = `
                <div class="mb-3">
                    <span class="text-lg font-bold text-primary tracking-wide">${item.productName}</span>
                </div>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 text-sm">
                    <div class="flex flex-col">
                        <span class="text-gray-500 font-medium">Batch</span>
                        <span class="text-foreground font-semibold">${item.batchNumber}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-gray-500 font-medium">Qty in Box</span>
                        <span class="text-foreground font-semibold">${item.quantityInBox}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-gray-500 font-medium">Weight/Vol</span>
                        <span class="text-foreground font-semibold">${item.weightVolume}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-gray-500 font-medium">MFG Date</span>
                        <span class="text-foreground font-semibold">${item.mfgDate}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-gray-500 font-medium">Copies</span>
                        <span class="text-foreground font-semibold">${item.numberOfStickers}</span>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <button type="button" class="remove-item-btn text-red-600 hover:text-red-700 transition-colors duration-200" data-id="${item.id}" aria-label="Remove label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
            labelArrayList.appendChild(div);
        });
    }
    if (arrayStatusSpan) {
        arrayStatusSpan.textContent = `${totalStickers} / ${MAX_TOTAL_STICKERS}`;
    }
    // Defensive: If not found, do nothing (prevents error)

    // Update "Add to Array" button state
    const stickersToAdd = parseInt(numberOfStickersInput.value, 10) || 0;
    if (totalStickers >= MAX_TOTAL_STICKERS) {
        addToArrayButton.disabled = true;
        addToArrayButton.textContent = 'Sticker Array Full';
    } else if (totalStickers + stickersToAdd > MAX_TOTAL_STICKERS && stickersToAdd > 0) {
        addToArrayButton.disabled = true;
        addToArrayButton.textContent = 'Exceeds Limit';
    } else {
        addToArrayButton.disabled = false;
        addToArrayButton.textContent = 'Add to PDF Array';
    }
}

function handleAddToArray() {
    const productName = productNameInput.value.trim();
    const batchNumber = batchNumberInput.value.trim();
    let quantityInBox = quantityInBoxInput.value.trim();
    const weightVolume = getWeightVolume();
    const mfgDate = mfgDateInput.value.trim();
    const numberOfStickers = parseInt(numberOfStickersInput.value, 10);

    // Check if all required fields are filled and add shake effect to empty ones
    let hasEmptyFields = false;
    
    // Remove existing shake class from all inputs
    document.querySelectorAll('.shake-error').forEach(element => {
        element.classList.remove('shake-error');
    });
    
    // Modified validation checks to allow asterisk
    if (!productName || (!isValidBlankValue(productName) && productName.length > 17)) {
        productNameInput.classList.add('shake-error');
        hasEmptyFields = true;
    }
    if (!batchNumber || (!isValidBlankValue(batchNumber) && batchNumber.length > 5)) {
        batchNumberInput.classList.add('shake-error');
        hasEmptyFields = true;
    }
    if (!quantityInBox || (!isValidBlankValue(quantityInBox) && !quantityInBox.match(/^\d{1,4} NOS$/))) {
        quantityInBoxInput.classList.add('shake-error');
        hasEmptyFields = true;
    }
    if (!weightVolumeValueInput.value || (!isValidBlankValue(weightVolumeValueInput.value) && !isValidNumberOrBlank(weightVolumeValueInput.value))) {
        weightVolumeValueInput.classList.add('shake-error');
        hasEmptyFields = true;
    }
    if (!mfgDate || (!isValidBlankValue(mfgDate) && !mfgDate.match(/^\d{2}\/[A-Z]{3}\/\d{4}$/))) {
        mfgDateInput.classList.add('shake-error');
        hasEmptyFields = true;
    }
    if (isNaN(numberOfStickers) || numberOfStickers <= 0) {
        numberOfStickersInput.classList.add('shake-error');
        hasEmptyFields = true;
    }

    if (hasEmptyFields) {
        showToast("Please fill in all the required details before adding to the array.");
        return;
    }
    
    // Remove shake class after animation completes
    setTimeout(() => {
        document.querySelectorAll('.shake-error').forEach(element => {
            element.classList.remove('shake-error');
        });
    }, 400);

    // Validate field lengths after ensuring all fields are filled
    if (productName.length > 17) {
        showToast("Product name can be at most 17 characters");
        return;
    }
    if (batchNumber.length > 5) {
        showToast("Batch number can be at most 5 characters");
        return;
    }

    const totalStickersInArray = calculateTotalStickersInArray();
    if (totalStickersInArray + numberOfStickers > MAX_TOTAL_STICKERS) {
        showCustomModal('Array Limit Reached', `Adding ${numberOfStickers} sticker(s) would exceed the array limit of ${MAX_TOTAL_STICKERS} total stickers. Currently ${totalStickersInArray} stickers in array.`, true);
        return;
    }

    const newItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        productName, batchNumber, quantityInBox, weightVolume, mfgDate, numberOfStickers
    };
    labelArray.push(newItem);
    updateArrayDisplayAndButtonStates();
    // Clear only the number of stickers input
    numberOfStickersInput.value = '';
    productNameInput.focus();
    
    // Show success toast message without OK button for 2.5 seconds
    showToast(`${productName} added to array with ${numberOfStickers} ${pluralize('sticker', numberOfStickers)}.`);
}

function handleRemoveFromArray(itemId) {
    const itemIndex = labelArray.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const removedItem = labelArray.splice(itemIndex, 1)[0];
        updateArrayDisplayAndButtonStates();
        // Show removed toast message without OK button for 2.5 seconds
        showToast(`"${removedItem.productName}" removed from array.`);
    }
}

// Keep form handling and PDF generation functionality
document.addEventListener('DOMContentLoaded', () => {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    if (labelForm) labelForm.reset(); // Ensure form is clear on load
    if (numberOfStickersInput) numberOfStickersInput.value = ''; // Specifically clear number input
    updateArrayDisplayAndButtonStates(); // Initial state
    if (productNameInput) productNameInput.focus();

    // Remove shake-error class when user starts typing/changing any input
    const formInputs = [
        productNameInput,
        batchNumberInput,
        quantityInBoxInput,
        weightVolumeValueInput,
        weightVolumeUnitInput,
        mfgDateInput,
        numberOfStickersInput
    ];

    formInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                this.classList.remove('shake-error');
            });
        }
    });
});

// --- Toast Notification ---
function showToast(message, options = {}) {
    // Remove any existing toast
    let existing = document.getElementById('customToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'customToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '32px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#222';
    toast.style.color = '#fff';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '6px';
    toast.style.fontSize = '1rem';
    toast.style.zIndex = '99999';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.pointerEvents = 'auto';

    if (options.confirm) {
        // Confirmation dialog with Yes/No buttons
        toast.innerHTML = `<span style='margin-right:8px;'>${message}</span>`;
        const yesBtn = document.createElement('button');
        yesBtn.textContent = options.yesText || 'Yes';
        yesBtn.style.background = '#00b1b8';
        yesBtn.style.color = '#fff';
        yesBtn.style.border = 'none';
        yesBtn.style.borderRadius = '4px';
        yesBtn.style.padding = '4px 14px';
        yesBtn.style.marginRight = '4px';
        yesBtn.style.cursor = 'pointer';
        yesBtn.onclick = () => {
            if (options.onYes) options.onYes();
            toast.remove();
        };
        const noBtn = document.createElement('button');
        noBtn.textContent = options.noText || 'No';
        noBtn.style.background = '#eee';
        noBtn.style.color = '#222';
        noBtn.style.border = 'none';
        noBtn.style.borderRadius = '4px';
        noBtn.style.padding = '4px 14px';
        noBtn.style.cursor = 'pointer';
        noBtn.onclick = () => {
            if (options.onNo) options.onNo();
            toast.remove();
        };
        toast.appendChild(yesBtn);
        toast.appendChild(noBtn);
    } else if (options.okButton || options.persist) {
        // Message with OK button
        toast.innerHTML = `<span style='margin-right:8px;'>${message}</span>`;
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.background = '#00b1b8';
        okBtn.style.color = '#fff';
        okBtn.style.border = 'none';
        okBtn.style.borderRadius = '4px';
        okBtn.style.padding = '4px 14px';
        okBtn.style.cursor = 'pointer';
        okBtn.onclick = () => toast.remove();
        toast.appendChild(okBtn);
    } else {
        // Regular auto-dismissing toast
        toast.innerHTML = `<span>${message}</span>`;
    }

    // Use the toast container if present
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
        toastContainer.appendChild(toast);
    } else {
        document.body.appendChild(toast);
    }
    setTimeout(() => { toast.style.opacity = '1'; }, 10);

    // Auto-dismiss if not a confirmation or persistent message
    if (!options.confirm && !options.persist && !options.okButton) {
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.remove(); }, 200);
        }, 2500);
    }
}

// Replace all confirmation modals with toast-based confirmations
function confirmGeneratePDF() {
    const total = calculateTotalStickersInArray();
    showToast(
        `Generate PDF for all <strong>${total}</strong> ${pluralize('sticker', total)}?`,
        {
            confirm: true,
            yesText: 'Yes',
            noText: 'No',
            onYes: () => generateCombinedPDF(),
            onNo: () => {} // do nothing
        }
    );
}

// Clear form confirmation as toast
if (labelForm) {
    const clearBtn = document.getElementById('clearFormButton');
    if (clearBtn) {
        clearBtn.onclick = () => {
            // Only check text inputs, ignore selects (dropdowns)
            const inputs = labelForm.querySelectorAll('input[type="text"], input[type="number"], input[type="password"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"]');
            let hasValue = false;
            for (const input of inputs) {
                if (typeof input.value === 'string' && input.value.trim().length > 0) {
                    hasValue = true;
                    break;
                }
            }
            if (!hasValue) {
                setTimeout(() => showToast('There is nothing to clear in the form.'), 0);
                return;
            }
            showToast(
                'Clear all fields in <strong>Enter Label Details</strong>?',
                {
                    confirm: true,
                    yesText: 'Yes',
                    noText: 'No',
                    onYes: () => labelForm.reset(),
                    onNo: () => {}
                }
            );
        };
    }
}

// --- PDF Generation ---
async function generateCombinedPDF() {
    if (labelArray.length === 0) {
        showCustomModal('Empty Array', 'Add labels to the array before generating PDF.', true);
        return;
    }

    generateAllButton.disabled = true;
    const playSpan = generateAllButton.querySelector('.play');
    const nowSpan = generateAllButton.querySelector('.now');
    if (playSpan && nowSpan) {
        playSpan.textContent = 'Generating...';
        nowSpan.textContent = '';
    }

    try {
        const response = await fetch('/generate-labels-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                labels: labelArray
            })
        });
        if (!response.ok) throw new Error('PDF generation failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create filename with first product name and current date
        const firstProduct = labelArray[0].productName.replace(/[^\w\s-]/g, ''); // Remove special chars
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const fileName = `${firstProduct}_${currentDate} (LABEL).pdf`;

        // Create a permanent iframe for printing
        const printFrame = document.createElement('iframe');
        printFrame.id = 'printFrame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = 'none';
        document.body.appendChild(printFrame);

        // Set iframe source and handle printing
        printFrame.src = url;
        printFrame.onload = () => {
            try {
                // Print the document
                printFrame.contentWindow.print();
            } catch (e) {
                console.error('Print failed:', e);
            }
        };

        // Also trigger download with new filename
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Keep the URL valid for printing
        // Only revoke URL when user closes the page
        window.addEventListener('beforeunload', () => {
            window.URL.revokeObjectURL(url);
            printFrame.remove();
        });

        showToast('PDF generated and sent to printer');
    } catch (error) {
        console.error("Error generating PDF:", error);
        showToast(`Error: ${error.message}. Check console.`, { persist: true });
    } finally {
        generateAllButton.disabled = labelArray.length === 0;
        const playSpan = generateAllButton.querySelector('.play');
        const nowSpan = generateAllButton.querySelector('.now');
        if (playSpan && nowSpan) {
            playSpan.textContent = 'Generate All Labels';
            nowSpan.textContent = '?';
        }
    }
}

// --- Custom Input Restrictions & Formatting ---

// Product Name: Limit to 17 characters (handled by maxlength in HTML)
// Batch Number: Limit to 5 characters (handled by maxlength in HTML)

// Quantity in Box: Only 4 digits, always ends with " NOS" (append on blur, not during typing)
if (quantityInBoxInput) {
    quantityInBoxInput.addEventListener('input', function (e) {
        // Allow asterisk or digits
        let val = this.value;
        if (val === '*') {
            this.value = '*';
        } else {
            // Remove all non-digits and limit to 4
            val = val.replace(/\D/g, '').slice(0, 4);
            this.value = val;
        }
    });
    quantityInBoxInput.addEventListener('blur', function () {
        let val = this.value;
        if (val === '*') {
            this.value = '*';
        } else {
            val = val.replace(/\D/g, '').slice(0, 4);
            if (val) {
                this.value = val + ' NOS';
            } else {
                this.value = '';
            }
        }
    });
    quantityInBoxInput.addEventListener('focus', function () {
        // Remove NOS suffix for editing
        let val = this.value.replace(/\D/g, '').slice(0, 4);
        this.value = val;
    });
}

// Weight/Volume: Only 3 digits + dropdown for unit
const weightVolumeValueInput = document.getElementById('weightVolumeValue');
const weightVolumeUnitInput = document.getElementById('weightVolumeUnit');

function getWeightVolume() {
    if (!weightVolumeValueInput || !weightVolumeUnitInput) return '';
    if (!weightVolumeValueInput.value) return '';
    if (weightVolumeValueInput.value === '*') return '*';
    return weightVolumeValueInput.value + ' ' + weightVolumeUnitInput.value.toLowerCase();
}

// Manufacture Date: Format on blur only
const MONTHS = [
    '', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

function convertToFourDigitYear(year) {
    if (year.length === 2) {
        const twoDigitYear = parseInt(year, 10);
        // Convert 2-digit year to 4-digit year
        // Years 00-89 will be considered 2000-2089
        // Years 90-99 will be considered 2090-2099
        return twoDigitYear >= 0 && twoDigitYear <= 99 ? 
            `20${year.padStart(2, '0')}` : year;
    }
    return year;
}

if (mfgDateInput) {
    mfgDateInput.addEventListener('blur', function () {
        let val = this.value.trim();
        // Accept formats like 1/5/25, 01/05/2025, 1-5-25, 01-05-2025, 1.5.25, 01.05.2025 etc.
        let match = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2}|\d{4})$/);
        if (match) {
            let day = match[1].padStart(2, '0');
            let monthNum = parseInt(match[2], 10);
            let year = convertToFourDigitYear(match[3]);
            let monthStr = (monthNum >= 1 && monthNum <= 12) ? MONTHS[monthNum] : '';
            if (monthStr) {
                this.value = `${day}/${monthStr}/${year}`;
            }
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    if (labelForm) labelForm.reset(); // Ensure form is clear on load
    if (numberOfStickersInput) numberOfStickersInput.value = ''; // Specifically clear number input
    updateArrayDisplayAndButtonStates(); // Initial state
    if (productNameInput) productNameInput.focus();

    // Remove shake-error class when user starts typing/changing any input
    const formInputs = [
        productNameInput,
        batchNumberInput,
        quantityInBoxInput,
        weightVolumeValueInput,
        weightVolumeUnitInput,
        mfgDateInput,
        numberOfStickersInput
    ];

    formInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                this.classList.remove('shake-error');
            });
        }
    });
});

// Utility Functions
function pluralize(word, count) {
    return count === 1 ? word : word + 's';
}

// --- Event Listeners ---
if (addToArrayButton) addToArrayButton.addEventListener('click', handleAddToArray);
if (generateAllButton) generateAllButton.addEventListener('click', confirmGeneratePDF);
if (modalCloseButton) modalCloseButton.addEventListener('click', hideCustomModal);

if (modal) {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) hideCustomModal();
    });
}

if (labelArrayList) {
    labelArrayList.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-item-btn');
        if (removeButton) {
            handleRemoveFromArray(removeButton.dataset.id);
        }
    });
}

if (numberOfStickersInput) {
    numberOfStickersInput.addEventListener('input', updateArrayDisplayAndButtonStates);
}

// Add these validation functions near the top with other constants
function isValidBlankValue(value) {
    return value === '*';
}

function isValidNumberOrBlank(value) {
    return value === '*' || /^\d+$/.test(value);
}



