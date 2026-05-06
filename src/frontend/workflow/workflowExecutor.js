export async function handleWorkflow(wf, db) {
    // Entry point for running a workflow based on its intention
    console.log("Running workflow:", wf.title);

    // Run OneNote summarisation workflow
    if (wf.intention === "summarize_note") {
        await runSummarizeWorkflow(wf, db);
    }

    // Run OneDrive file organisation workflow
    if (wf.intention === "organize_files") {
        await runOrganizeFilesWorkflow(wf);
    }
}

async function runSummarizeWorkflow(wf, db) {
    try {
        // Send workflow details to Python backend for OneNote summarisation
        console.log("Calling AI for:", wf.title);

        const response = await fetch('http://127.0.0.1:5000/summarize-latest-onenote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: wf.des,
                lastProcessedPageId: wf.lastProcessedPageId
            })
        });

        // Read raw response text for debugging and safe error logging
        const text = await response.text();

        // Stop if backend request failed
        if (!response.ok) {
            console.error("OneNote API failed:", response.status, text);
            return;
        }

        // Convert backend response into JSON
        const data = JSON.parse(text);

        // Skip workflow if backend decides the latest note is not relevant
        if (data.skipped) {
            console.log("Skipped:", data.reason, data.sourceTitle);
            if (data.match) {
                console.log("Match reason:", data.match.reason);
                console.log("Match confidence:", data.match.confidence);
            }
            return;
        }

        console.log("sourcePageId:", data.sourcePageId);
        console.log("lastProcessedPageId:", wf.lastProcessedPageId);

        // Prevent processing the same OneNote page more than once
        if (data.sourcePageId && data.sourcePageId === wf.lastProcessedPageId) {
            console.log("Already processed this OneNote page, skipping:", data.sourceTitle);
            return;
        }

        // Extra safety check for skipped responses
        if (data.skipped) {
            console.log("Skipped:", data.reason, data.sourceTitle);
            return;
        }

        // Log generated summary result
        console.log("Summary result:", data.summary);

        // Save processed page ID to avoid duplicate summaries in future runs
        if (data.sourcePageId) {
            const updated = await db.updateWorkflowProcessedPage(wf.jobID, data.sourcePageId);
            console.log("Updated lastProcessedPageId:", updated);
        }

    } catch (err) {
        // Catch network, JSON parsing, and database update errors
        console.error("runSummarizeWorkflow error:", err);
    }
}

async function runOrganizeFilesWorkflow(wf) {
    try {
        // Parse stored workflow rule from database
        const rule = JSON.parse(wf.workflowRule || "{}");

        console.log("Running organize files workflow:", rule);

        // Send file organisation rule to Python backend
        const response = await fetch("http://127.0.0.1:5000/organize-onedrive-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rule })
        });

        // Read backend response as text for easier debugging
        const text = await response.text();

        // Stop if backend request failed
        if (!response.ok) {
            console.error("Organize files API failed:", response.status, text);
            return;
        }

        // Parse and log organisation result
        const data = JSON.parse(text);
        console.log("Organize files result:", data.results);

    } catch (err) {
        // Catch invalid workflow rules, network errors, and JSON parsing errors
        console.error("Organize files error:", err);
    }
}