/* =========================================================
   BANKER'S ALGORITHM SIMULATOR
   JAVASCRIPT
   ========================================================= */


/* ---------------------------------------------------------
   PAGE LOAD
   --------------------------------------------------------- */

window.onload = function () {
    generateMatrices();
};


/* ---------------------------------------------------------
   GENERATE MATRICES
   --------------------------------------------------------- */

function generateMatrices() {

    hideError();
    hideRequestError();

    const processCount =
        parseInt(document.getElementById("processCount").value);

    const resourceCount =
        parseInt(document.getElementById("resourceCount").value);

    if (
        isNaN(processCount) ||
        isNaN(resourceCount) ||
        processCount < 1 ||
        resourceCount < 1
    ) {
        showError(
            "Please enter valid numbers of processes and resources."
        );
        return;
    }

    if (processCount > 10 || resourceCount > 10) {
        showError(
            "Maximum allowed is 10 processes and 10 resource types."
        );
        return;
    }

    createMatrix(
        "allocationContainer",
        "allocation",
        processCount,
        resourceCount
    );

    createMatrix(
        "maximumContainer",
        "maximum",
        processCount,
        resourceCount
    );

    createResourceInputs(resourceCount);

    initializeRequestSection();

    clearResults();
}


/* ---------------------------------------------------------
   CREATE MATRIX
   --------------------------------------------------------- */

function createMatrix(
    containerId,
    matrixName,
    rows,
    columns
) {

    const container =
        document.getElementById(containerId);

    let html = "";

    html += "<table>";

    html += "<thead>";
    html += "<tr>";
    html += "<th>Process</th>";

    for (let j = 0; j < columns; j++) {
        html += "<th>R" + j + "</th>";
    }

    html += "</tr>";
    html += "</thead>";

    html += "<tbody>";

    for (let i = 0; i < rows; i++) {

        html += "<tr>";

        html += "<td>P" + i + "</td>";

        for (let j = 0; j < columns; j++) {

            html +=
                '<td>' +
                '<input type="number" ' +
                'min="0" ' +
                'value="0" ' +
                'class="matrix-input ' +
                matrixName +
                '-input" ' +
                'data-row="' + i + '" ' +
                'data-col="' + j + '">' +
                '</td>';
        }

        html += "</tr>";
    }

    html += "</tbody>";
    html += "</table>";

    container.innerHTML = html;
}


/* ---------------------------------------------------------
   CREATE RESOURCE INPUTS
   --------------------------------------------------------- */

function createResourceInputs(resourceCount) {

    const container =
        document.getElementById("resourceContainer");

    const selectedMode =
        document.querySelector(
            'input[name="resourceMode"]:checked'
        );

    const mode =
        selectedMode ? selectedMode.value : "total";

    const title =
        mode === "total"
            ? "Total Resources"
            : "Available Resources";

    let html = "";

    html += "<h3>" + title + "</h3>";

    html += '<div class="matrix-wrapper">';
    html += "<table>";

    html += "<thead>";
    html += "<tr>";

    for (let j = 0; j < resourceCount; j++) {
        html += "<th>R" + j + "</th>";
    }

    html += "</tr>";
    html += "</thead>";

    html += "<tbody>";
    html += "<tr>";

    for (let j = 0; j < resourceCount; j++) {

        html +=
            '<td>' +
            '<input type="number" ' +
            'min="0" ' +
            'value="0" ' +
            'class="resource-input" ' +
            'data-resource="' + j + '">' +
            '</td>';
    }

    html += "</tr>";
    html += "</tbody>";

    html += "</table>";
    html += "</div>";

    container.innerHTML = html;
}


/* ---------------------------------------------------------
   CHANGE RESOURCE MODE
   --------------------------------------------------------- */

function changeResourceMode() {

    const resourceCount =
        parseInt(
            document.getElementById("resourceCount").value
        );

    if (
        !isNaN(resourceCount) &&
        resourceCount > 0
    ) {
        createResourceInputs(resourceCount);
    }

    clearResults();
}


/* ---------------------------------------------------------
   GET MATRIX
   --------------------------------------------------------- */

function getMatrix(className) {

    const processCount =
        parseInt(
            document.getElementById("processCount").value
        );

    const resourceCount =
        parseInt(
            document.getElementById("resourceCount").value
        );

    const inputs =
        document.querySelectorAll(
            "." + className + "-input"
        );

    const matrix = [];

    for (let i = 0; i < processCount; i++) {

        matrix[i] = [];

        for (let j = 0; j < resourceCount; j++) {
            matrix[i][j] = 0;
        }
    }

    inputs.forEach(function (input) {

        const row =
            parseInt(input.dataset.row);

        const col =
            parseInt(input.dataset.col);

        matrix[row][col] =
            parseInt(input.value) || 0;
    });

    return matrix;
}


/* ---------------------------------------------------------
   GET RESOURCE VECTOR
   --------------------------------------------------------- */

function getResourceVector() {

    const inputs =
        document.querySelectorAll(
            ".resource-input"
        );

    const vector = [];

    inputs.forEach(function (input) {

        vector.push(
            parseInt(input.value) || 0
        );
    });

    return vector;
}


/* ---------------------------------------------------------
   CALCULATE NEED
   --------------------------------------------------------- */

function calculateNeed(
    maximum,
    allocation
) {

    const need = [];

    for (let i = 0; i < maximum.length; i++) {

        need[i] = [];

        for (
            let j = 0;
            j < maximum[i].length;
            j++
        ) {

            need[i][j] =
                maximum[i][j] -
                allocation[i][j];
        }
    }

    return need;
}


/* ---------------------------------------------------------
   CALCULATE AVAILABLE FROM TOTAL
   --------------------------------------------------------- */

function calculateAvailableFromTotal(
    total,
    allocation
) {

    const available = [];

    for (let j = 0; j < total.length; j++) {

        let allocated = 0;

        for (let i = 0; i < allocation.length; i++) {

            allocated +=
                allocation[i][j];
        }

        available[j] =
            total[j] - allocated;
    }

    return available;
}


/* ---------------------------------------------------------
   FORMAT VECTOR
   --------------------------------------------------------- */

function formatVector(vector) {

    return "[" + vector.join(", ") + "]";
}


/* ---------------------------------------------------------
   VALIDATE MATRICES
   --------------------------------------------------------- */

function validateMatrices(
    allocation,
    maximum
) {

    for (let i = 0; i < allocation.length; i++) {

        for (
            let j = 0;
            j < allocation[i].length;
            j++
        ) {

            if (
                allocation[i][j] < 0 ||
                maximum[i][j] < 0
            ) {
                return false;
            }

            if (
                maximum[i][j] <
                allocation[i][j]
            ) {
                return false;
            }
        }
    }

    return true;
}


/* ---------------------------------------------------------
   RUN BANKER'S ALGORITHM
   --------------------------------------------------------- */

function runBankersAlgorithm() {

    hideError();

    const allocation =
        getMatrix("allocation");

    const maximum =
        getMatrix("maximum");

    if (
        !validateMatrices(
            allocation,
            maximum
        )
    ) {

        showError(
            "Maximum value cannot be smaller than Allocation value."
        );

        return;
    }

    const need =
        calculateNeed(
            maximum,
            allocation
        );

    const selectedMode =
        document.querySelector(
            'input[name="resourceMode"]:checked'
        );

    const mode =
        selectedMode
            ? selectedMode.value
            : "total";

    const resourceVector =
        getResourceVector();

    let available;

    if (mode === "total") {

        available =
            calculateAvailableFromTotal(
                resourceVector,
                allocation
            );

        for (
            let j = 0;
            j < available.length;
            j++
        ) {

            if (available[j] < 0) {

                showError(
                    "Total resources cannot be smaller than the resources already allocated."
                );

                return;
            }
        }

    } else {

        available =
            resourceVector.slice();
    }

    displayAvailable(available);

    displayMatrix(
        "needContainer",
        need
    );

    executeSafetyAlgorithm(
        allocation,
        need,
        available
    );

    initializeRequestSection();
}


/* ---------------------------------------------------------
   DISPLAY AVAILABLE
   --------------------------------------------------------- */

function displayAvailable(available) {

    document.getElementById(
        "availableResult"
    ).innerHTML =
        '<div class="available-box">' +
        '<strong>Available Resources:</strong> ' +
        formatVector(available) +
        '</div>';
}


/* ---------------------------------------------------------
   DISPLAY MATRIX
   --------------------------------------------------------- */

function displayMatrix(
    containerId,
    matrix
) {

    const container =
        document.getElementById(containerId);

    if (
        !matrix ||
        matrix.length === 0
    ) {

        container.innerHTML = "";
        return;
    }

    let html = "";

    html += '<table class="need-table">';

    html += "<thead>";
    html += "<tr>";
    html += "<th>Process</th>";

    for (
        let j = 0;
        j < matrix[0].length;
        j++
    ) {

        html += "<th>R" + j + "</th>";
    }

    html += "</tr>";
    html += "</thead>";

    html += "<tbody>";

    for (
        let i = 0;
        i < matrix.length;
        i++
    ) {

        html += "<tr>";

        html +=
            "<td>P" + i + "</td>";

        for (
            let j = 0;
            j < matrix[i].length;
            j++
        ) {

            html +=
                "<td>" +
                matrix[i][j] +
                "</td>";
        }

        html += "</tr>";
    }

    html += "</tbody>";
    html += "</table>";

    container.innerHTML = html;
}


/* ---------------------------------------------------------
   CHECK WHETHER PROCESS CAN EXECUTE
   --------------------------------------------------------- */

function canExecute(
    needRow,
    work
) {

    for (
        let j = 0;
        j < needRow.length;
        j++
    ) {

        if (
            needRow[j] >
            work[j]
        ) {
            return false;
        }
    }

    return true;
}


/* ---------------------------------------------------------
   SAFETY ALGORITHM
   --------------------------------------------------------- */

function executeSafetyAlgorithm(
    allocation,
    need,
    available
) {

    const stepsContainer =
        document.getElementById(
            "stepsContainer"
        );

    const finalResult =
        document.getElementById(
            "finalResult"
        );

    stepsContainer.innerHTML = "";
    finalResult.innerHTML = "";
    finalResult.className = "";

    let work =
        available.slice();

    const finish =
        new Array(
            allocation.length
        ).fill(false);

    const safeSequence = [];

    let progress = true;

    let stepNumber = 1;

    while (
        safeSequence.length <
            allocation.length &&
        progress
    ) {

        progress = false;

        for (
            let i = 0;
            i < allocation.length;
            i++
        ) {

            if (finish[i]) {
                continue;
            }

            if (
                canExecute(
                    need[i],
                    work
                )
            ) {

                const workBefore =
                    work.slice();

                for (
                    let j = 0;
                    j < work.length;
                    j++
                ) {

                    work[j] +=
                        allocation[i][j];
                }

                finish[i] = true;

                safeSequence.push(i);

                progress = true;

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "step-card";

                card.innerHTML =
                    '<div class="step-header">' +

                    '<strong>' +
                    'Step ' +
                    stepNumber +
                    ': Execute P' +
                    i +
                    '</strong>' +

                    '<span class="step-status">' +
                    'Can Execute' +
                    '</span>' +

                    '</div>' +

                    '<div class="step-values">' +

                    '<div class="value-box">' +
                    '<span>Need[P' +
                    i +
                    ']</span>' +
                    '<strong>' +
                    formatVector(
                        need[i]
                    ) +
                    '</strong>' +
                    '</div>' +

                    '<div class="value-box">' +
                    '<span>Work Before</span>' +
                    '<strong>' +
                    formatVector(
                        workBefore
                    ) +
                    '</strong>' +
                    '</div>' +

                    '<div class="value-box">' +
                    '<span>Work After</span>' +
                    '<strong>' +
                    formatVector(
                        work
                    ) +
                    '</strong>' +
                    '</div>' +

                    '</div>' +

                    '<p style="margin-top:12px;">' +

                    'Since Need[P' +
                    i +
                    '] is less than or equal to Work, ' +

                    'P' +
                    i +
                    ' can complete. ' +

                    'Its allocated resources are released back to Work.' +

                    '</p>';

                stepsContainer.appendChild(
                    card
                );

                stepNumber++;
            }
        }
    }


    /* ---------- SAFE STATE ---------- */

    if (
        safeSequence.length ===
        allocation.length
    ) {

        finalResult.className =
            "final-result safe";

        finalResult.innerHTML =
            '<strong>SAFE STATE</strong>' +

            '<p style="margin-top:8px;">' +
            'All processes can complete without causing deadlock.' +
            '</p>' +

            '<p class="safe-sequence">' +
            'Safe Sequence: ' +

            safeSequence
                .map(function (process) {
                    return "P" + process;
                })
                .join(" → ") +

            '</p>';

    }


    /* ---------- UNSAFE STATE ---------- */

    else {

        const unfinished = [];

        for (
            let i = 0;
            i < finish.length;
            i++
        ) {

            if (!finish[i]) {
                unfinished.push(
                    "P" + i
                );
            }
        }

        finalResult.className =
            "final-result unsafe";

        finalResult.innerHTML =
            '<strong>UNSAFE STATE</strong>' +

            '<p style="margin-top:8px;">' +
            'The system cannot find a safe sequence for all processes.' +
            '</p>' +

            '<p style="margin-top:8px;">' +
            'Processes that cannot complete: ' +
            unfinished.join(", ") +
            '</p>';
    }
}


/* =========================================================
   RESOURCE REQUEST ALGORITHM
   ========================================================= */


/* ---------------------------------------------------------
   INITIALIZE REQUEST SECTION
   --------------------------------------------------------- */

function initializeRequestSection() {

    const processCount =
        parseInt(
            document.getElementById(
                "processCount"
            ).value
        );

    const select =
        document.getElementById(
            "requestProcess"
        );

    select.innerHTML = "";

    for (
        let i = 0;
        i < processCount;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value = i;

        option.textContent =
            "P" + i;

        select.appendChild(
            option
        );
    }

    createRequestVector();
}


/* ---------------------------------------------------------
   CREATE REQUEST VECTOR
   --------------------------------------------------------- */

function createRequestVector() {

    const resourceCount =
        parseInt(
            document.getElementById(
                "resourceCount"
            ).value
        );

    const container =
        document.getElementById(
            "requestVectorContainer"
        );

    let html = "";

    html +=
        "<table class='request-vector-table'>";

    html += "<thead>";
    html += "<tr>";

    for (
        let j = 0;
        j < resourceCount;
        j++
    ) {

        html +=
            "<th>R" + j + "</th>";
    }

    html += "</tr>";
    html += "</thead>";

    html += "<tbody>";
    html += "<tr>";

    for (
        let j = 0;
        j < resourceCount;
        j++
    ) {

        html +=
            '<td>' +
            '<input type="number" ' +
            'min="0" ' +
            'value="0" ' +
            'class="request-vector-input" ' +
            'data-request-col="' +
            j +
            '">' +
            '</td>';
    }

    html += "</tr>";
    html += "</tbody>";

    html += "</table>";

    container.innerHTML =
        html;
}


/* ---------------------------------------------------------
   GET REQUEST VECTOR
   --------------------------------------------------------- */

function getRequestVector() {

    const inputs =
        document.querySelectorAll(
            ".request-vector-input"
        );

    const request = [];

    inputs.forEach(function (input) {

        request.push(
            parseInt(input.value) || 0
        );
    });

    return request;
}


/* ---------------------------------------------------------
   VECTOR LESS THAN OR EQUAL
   --------------------------------------------------------- */

function vectorLessThanOrEqual(
    first,
    second
) {

    if (
        first.length !==
        second.length
    ) {
        return false;
    }

    for (
        let j = 0;
        j < first.length;
        j++
    ) {

        if (
            first[j] >
            second[j]
        ) {
            return false;
        }
    }

    return true;
}


/* ---------------------------------------------------------
   SUBTRACT VECTORS
   --------------------------------------------------------- */

function subtractVectors(
    first,
    second
) {

    const result = [];

    for (
        let j = 0;
        j < first.length;
        j++
    ) {

        result.push(
            first[j] -
            second[j]
        );
    }

    return result;
}


/* ---------------------------------------------------------
   ADD VECTORS
   --------------------------------------------------------- */

function addVectors(
    first,
    second
) {

    const result = [];

    for (
        let j = 0;
        j < first.length;
        j++
    ) {

        result.push(
            first[j] +
            second[j]
        );
    }

    return result;
}


/* ---------------------------------------------------------
   TEMPORARY SAFETY CHECK
   --------------------------------------------------------- */

function performTemporarySafetyCheck(
    allocation,
    need,
    available
) {

    let work =
        available.slice();

    const finish =
        new Array(
            allocation.length
        ).fill(false);

    const sequence = [];

    let progress = true;

    while (
        sequence.length <
            allocation.length &&
        progress
    ) {

        progress = false;

        for (
            let i = 0;
            i < allocation.length;
            i++
        ) {

            if (finish[i]) {
                continue;
            }

            if (
                canExecute(
                    need[i],
                    work
                )
            ) {

                for (
                    let j = 0;
                    j < work.length;
                    j++
                ) {

                    work[j] +=
                        allocation[i][j];
                }

                finish[i] = true;

                sequence.push(i);

                progress = true;
            }
        }
    }

    return {
        safe:
            sequence.length ===
            allocation.length,

        sequence:
            sequence
    };
}


/* ---------------------------------------------------------
   CHECK RESOURCE REQUEST
   --------------------------------------------------------- */

function checkResourceRequest() {

    hideRequestError();

    const allocation =
        getMatrix("allocation");

    const maximum =
        getMatrix("maximum");

    if (
        !validateMatrices(
            allocation,
            maximum
        )
    ) {

        showRequestError(
            "Please correct the Allocation and Maximum matrices first."
        );

        return;
    }

    const need =
        calculateNeed(
            maximum,
            allocation
        );

    const selectedMode =
        document.querySelector(
            'input[name="resourceMode"]:checked'
        );

    const mode =
        selectedMode
            ? selectedMode.value
            : "total";

    const resourceVector =
        getResourceVector();

    let available;

    if (mode === "total") {

        available =
            calculateAvailableFromTotal(
                resourceVector,
                allocation
            );

        for (
            let j = 0;
            j < available.length;
            j++
        ) {

            if (available[j] < 0) {

                showRequestError(
                    "Total resources are smaller than current allocation."
                );

                return;
            }
        }

    } else {

        available =
            resourceVector.slice();
    }


    const process =
        parseInt(
            document.getElementById(
                "requestProcess"
            ).value
        );


    const request =
        getRequestVector();


    /* ---------- VALIDATE REQUEST ---------- */

    for (
        let j = 0;
        j < request.length;
        j++
    ) {

        if (request[j] < 0) {

            showRequestError(
                "Request values cannot be negative."
            );

            return;
        }
    }


    /* ---------- CHECK REQUEST <= NEED ---------- */

    const withinNeed =
        vectorLessThanOrEqual(
            request,
            need[process]
        );


    /* ---------- CHECK REQUEST <= AVAILABLE ---------- */

    const withinAvailable =
        vectorLessThanOrEqual(
            request,
            available
        );


    const requestDecision =
        document.getElementById(
            "requestDecision"
        );

    const requestSteps =
        document.getElementById(
            "requestSteps"
        );


    requestSteps.innerHTML = "";


    /* =====================================================
       CHECK RESULT DISPLAY
       ===================================================== */

    let checksHTML = "";

    checksHTML +=
        '<div class="check-list">';


    if (withinNeed) {

        checksHTML +=
            '<div class="check-item check-pass">' +

            '✓ Request ' +
            formatVector(request) +

            ' ≤ Need[P' +
            process +
            '] ' +

            formatVector(
                need[process]
            ) +

            '</div>';

    } else {

        checksHTML +=
            '<div class="check-item check-fail">' +

            '✗ Request ' +
            formatVector(request) +

            ' > Need[P' +
            process +
            '] ' +

            formatVector(
                need[process]
            ) +

            '</div>';
    }


    if (withinAvailable) {

        checksHTML +=
            '<div class="check-item check-pass">' +

            '✓ Request ' +
            formatVector(request) +

            ' ≤ Available ' +

            formatVector(
                available
            ) +

            '</div>';

    } else {

        checksHTML +=
            '<div class="check-item check-fail">' +

            '✗ Request ' +
            formatVector(request) +

            ' > Available ' +

            formatVector(
                available
            ) +

            '</div>';
    }


    checksHTML +=
        "</div>";


    /* =====================================================
       REQUEST GREATER THAN NEED
       ===================================================== */

    if (!withinNeed) {

        requestDecision.className =
            "request-decision denied";

        requestDecision.innerHTML =
            '<strong>REQUEST DENIED</strong>' +

            '<p style="margin-top:8px;">' +

            'The process is requesting more resources ' +
            'than its remaining declared maximum need.' +

            '</p>' +

            checksHTML;

        return;
    }


    /* =====================================================
       REQUEST GREATER THAN AVAILABLE
       ===================================================== */

    if (!withinAvailable) {

        requestDecision.className =
            "request-decision denied";

        requestDecision.innerHTML =
            '<strong>REQUEST CANNOT BE GRANTED NOW</strong>' +

            '<p style="margin-top:8px;">' +

            'The requested resources are greater than ' +
            'the currently available resources.' +

            '</p>' +

            checksHTML;

        return;
    }


    /* =====================================================
       TEMPORARY ALLOCATION
       ===================================================== */

    const temporaryAvailable =
        subtractVectors(
            available,
            request
        );


    const temporaryAllocation =
        allocation.map(
            function (row) {
                return row.slice();
            }
        );


    const temporaryNeed =
        need.map(
            function (row) {
                return row.slice();
            }
        );


    temporaryAllocation[process] =
        addVectors(
            temporaryAllocation[process],
            request
        );


    temporaryNeed[process] =
        subtractVectors(
            temporaryNeed[process],
            request
        );


    /* =====================================================
       TEMPORARY SAFETY TEST
       ===================================================== */

    const safetyResult =
        performTemporarySafetyCheck(
            temporaryAllocation,
            temporaryNeed,
            temporaryAvailable
        );


    requestSteps.innerHTML =

        '<div class="request-step">' +

        '<strong>Step 1:</strong> ' +

        'Check Request ≤ Need.' +

        '<br>' +

        formatVector(request) +

        ' ≤ ' +

        formatVector(
            need[process]
        ) +

        ' → TRUE' +

        '</div>' +


        '<div class="request-step">' +

        '<strong>Step 2:</strong> ' +

        'Check Request ≤ Available.' +

        '<br>' +

        formatVector(request) +

        ' ≤ ' +

        formatVector(
            available
        ) +

        ' → TRUE' +

        '</div>' +


        '<div class="request-step">' +

        '<strong>Step 3:</strong> ' +

        'Temporarily allocate the requested resources.' +

        '<br>' +

        'New Available = ' +

        formatVector(
            temporaryAvailable
        ) +

        '</div>' +


        '<div class="request-step">' +

        '<strong>Step 4:</strong> ' +

        'Run the Safety Algorithm on the temporary state.' +

        '</div>';


    /* =====================================================
       REQUEST GRANTED
       ===================================================== */

    if (safetyResult.safe) {

        requestDecision.className =
            "request-decision granted";

        requestDecision.innerHTML =

            '<strong>REQUEST GRANTED IMMEDIATELY</strong>' +

            '<p style="margin-top:8px;">' +

            'The request satisfies all Banker’s Algorithm ' +
            'conditions and the system remains safe after ' +
            'temporarily allocating the resources.' +

            '</p>' +

            checksHTML +

            '<p style="margin-top:12px;">' +

            '<strong>Temporary Available:</strong> ' +

            formatVector(
                temporaryAvailable
            ) +

            '</p>' +

            '<p style="margin-top:8px;">' +

            '<strong>Safe Sequence After Granting:</strong> ' +

            safetyResult.sequence
                .map(function (p) {
                    return "P" + p;
                })
                .join(" → ") +

            '</p>';

    }


    /* =====================================================
       REQUEST DENIED BECAUSE UNSAFE
       ===================================================== */

    else {

        requestDecision.className =
            "request-decision denied";

        requestDecision.innerHTML =

            '<strong>REQUEST DENIED</strong>' +

            '<p style="margin-top:8px;">' +

            'The request satisfies the Need and Available ' +
            'conditions, but granting it would make the ' +
            'system unsafe.' +

            '</p>' +

            checksHTML +

            '<p style="margin-top:12px;">' +

            '<strong>Temporary Available:</strong> ' +

            formatVector(
                temporaryAvailable
            ) +

            '</p>' +

            '<p style="margin-top:8px;">' +

            'Therefore, Banker’s Algorithm does not grant ' +
            'the request.' +

            '</p>';
    }
}


/* =========================================================
   CLASSIC EXAMPLE
   ========================================================= */

function loadExample() {

    document.getElementById(
        "processCount"
    ).value = 5;

    document.getElementById(
        "resourceCount"
    ).value = 3;


    document.querySelector(
        'input[name="resourceMode"][value="total"]'
    ).checked = true;


    generateMatrices();


    const allocation = [

        [0, 1, 0],

        [2, 0, 0],

        [3, 0, 2],

        [2, 1, 1],

        [0, 0, 2]

    ];


    const maximum = [

        [7, 5, 3],

        [3, 2, 2],

        [9, 0, 2],

        [2, 2, 2],

        [4, 3, 3]

    ];


    const total = [

        10,
        5,
        7

    ];


    fillMatrix(
        "allocation-input",
        allocation
    );


    fillMatrix(
        "maximum-input",
        maximum
    );


    fillResources(
        total
    );


    runBankersAlgorithm();


    loadRequestExample();
}


/* ---------------------------------------------------------
   FILL MATRIX
   --------------------------------------------------------- */

function fillMatrix(
    className,
    matrix
) {

    const inputs =
        document.querySelectorAll(
            "." + className
        );

    inputs.forEach(function (input) {

        const row =
            parseInt(
                input.dataset.row
            );

        const col =
            parseInt(
                input.dataset.col
            );

        if (
            matrix[row] &&
            matrix[row][col] !== undefined
        ) {

            input.value =
                matrix[row][col];
        }
    });
}


/* ---------------------------------------------------------
   FILL RESOURCE VECTOR
   --------------------------------------------------------- */

function fillResources(values) {

    const inputs =
        document.querySelectorAll(
            ".resource-input"
        );

    inputs.forEach(function (input) {

        const index =
            parseInt(
                input.dataset.resource
            );

        if (
            values[index] !== undefined
        ) {

            input.value =
                values[index];
        }
    });
}


/* ---------------------------------------------------------
   LOAD REQUEST EXAMPLE
   --------------------------------------------------------- */

function loadRequestExample() {

    const processSelect =
        document.getElementById(
            "requestProcess"
        );

    processSelect.value = "1";

    createRequestVector();


    const inputs =
        document.querySelectorAll(
            ".request-vector-input"
        );


    const request =
        [1, 0, 2];


    inputs.forEach(function (input) {

        const col =
            parseInt(
                input.dataset.requestCol
            );

        input.value =
            request[col] !== undefined
                ? request[col]
                : 0;
    });


    checkResourceRequest();
}


/* ---------------------------------------------------------
   RESET SIMULATOR
   --------------------------------------------------------- */

function resetSimulator() {

    document.getElementById(
        "processCount"
    ).value = 5;

    document.getElementById(
        "resourceCount"
    ).value = 3;


    document.querySelector(
        'input[name="resourceMode"][value="total"]'
    ).checked = true;


    generateMatrices();

    clearResults();

    hideError();

    hideRequestError();
}


/* ---------------------------------------------------------
   CLEAR RESULTS
   --------------------------------------------------------- */

function clearResults() {

    const available =
        document.getElementById(
            "availableResult"
        );

    const need =
        document.getElementById(
            "needContainer"
        );

    const steps =
        document.getElementById(
            "stepsContainer"
        );

    const finalResult =
        document.getElementById(
            "finalResult"
        );

    const requestDecision =
        document.getElementById(
            "requestDecision"
        );

    const requestSteps =
        document.getElementById(
            "requestSteps"
        );


    if (available) {
        available.innerHTML = "";
    }


    if (need) {
        need.innerHTML = "";
    }


    if (steps) {
        steps.innerHTML = "";
    }


    if (finalResult) {
        finalResult.innerHTML = "";
        finalResult.className = "";
    }


    if (requestDecision) {
        requestDecision.innerHTML = "";
        requestDecision.className =
            "request-decision";
    }


    if (requestSteps) {
        requestSteps.innerHTML = "";
    }
}


/* ---------------------------------------------------------
   GENERAL ERROR
   --------------------------------------------------------- */

function showError(message) {

    const error =
        document.getElementById(
            "errorMessage"
        );

    error.textContent =
        message;

    error.style.display =
        "block";
}


function hideError() {

    const error =
        document.getElementById(
            "errorMessage"
        );

    error.textContent = "";

    error.style.display =
        "none";
}


/* ---------------------------------------------------------
   REQUEST ERROR
   --------------------------------------------------------- */

function showRequestError(message) {

    const error =
        document.getElementById(
            "requestError"
        );

    error.textContent =
        message;

    error.style.display =
        "block";
}


function hideRequestError() {

    const error =
        document.getElementById(
            "requestError"
        );

    error.textContent = "";

    error.style.display =
        "none";
}