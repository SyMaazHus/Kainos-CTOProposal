export async function handleWorkflow(wf, db) {
    console.log("Running workflow:", wf.title);

    if (wf.intention === "summarize_note") {
        await runSummarizeWorkflow(wf, db);
    }
}

async function runSummarizeWorkflow(wf, db) {
    try {
        console.log("Calling AI for:", wf.title);

        const response = await fetch('http://127.0.0.1:5000/summarize-latest-onenote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: wf.des,
                lastProcessedPageId: wf.lastProcessedPageId
            })
        });

        const text = await response.text();

        if (!response.ok) {
            console.error("OneNote API failed:", response.status, text);
            return;
        }

        const data = JSON.parse(text);

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

        if (data.sourcePageId && data.sourcePageId === wf.lastProcessedPageId) {
            console.log("Already processed this OneNote page, skipping:", data.sourceTitle);
            return;
        }

        if (data.skipped) {
            console.log("Skipped:", data.reason, data.sourceTitle);
            return;
        }

        console.log("Summary result:", data.summary);

        if (data.sourcePageId) {
            const updated = await db.updateWorkflowProcessedPage(wf.jobID, data.sourcePageId);
            console.log("Updated lastProcessedPageId:", updated);
        }

    } catch (err) {
        console.error("runSummarizeWorkflow error:", err);
    }
}

export async function handleWorkflow(wf, db) {
    console.log("Running workflow:", wf.title);

    if (wf.intention === "summarize_note") {
        await runSummarizeWorkflow(wf, db);
    }

    if (wf.intention === "organize_files") {
        await runOrganizeFilesWorkflow(wf);
    }
}

async function runOrganizeFilesWorkflow(wf) {
    try {
        const rule = JSON.parse(wf.workflowRule || "{}");

        console.log("Running organize files workflow:", rule);

        const response = await fetch("http://127.0.0.1:5000/organize-onedrive-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rule })
        });

        const text = await response.text();

        if (!response.ok) {
            console.error("Organize files API failed:", response.status, text);
            return;
        }

        const data = JSON.parse(text);
        console.log("Organize files result:", data.results);

    } catch (err) {
        console.error("Organize files error:", err);
    }
}