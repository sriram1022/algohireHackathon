import { useState } from "react";
import Papa from "papaparse";

const REQUIRED_HEADERS = ["fullName", "phone"];
const OPTIONAL_HEADERS = ["email", "completionDate"];

function CandidateCsvImport({ onImport }) {
    const [preview, setPreview] = useState([]);
    const [invalidRows, setInvalidRows] = useState([]);
    const [error, setError] = useState("");
    const [fileName, setFileName] = useState("");

    const reset = () => {
        setPreview([]);
        setInvalidRows([]);
        setError("");
        setFileName("");
    };

    const handleFileChange = (event) => {
        reset();

        const file = event.target.files?.[0];

        if (!file) return;

        setFileName(file.name);

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setError("Please upload a CSV file.");
            event.target.value = "";
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: "greedy",
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const headers = results.meta.fields || [];

                const missingHeaders = REQUIRED_HEADERS.filter(
                    (header) => !headers.includes(header)
                );

                const unsupportedHeaders = headers.filter(
                    (header) =>
                        !REQUIRED_HEADERS.includes(header) &&
                        !OPTIONAL_HEADERS.includes(header)
                );

                if (missingHeaders.length > 0) {
                    setError(
                        `Missing required columns: ${missingHeaders.join(", ")}`
                    );
                    return;
                }

                if (unsupportedHeaders.length > 0) {
                    setError(
                        `Unsupported columns: ${unsupportedHeaders.join(", ")}`
                    );
                    return;
                }

                const seenPhones = new Set();
                const seenEmails = new Set();

                const valid = [];
                const invalid = [];

                results.data.forEach((row, index) => {
                    const csvRowNumber = index + 2;

                    const candidate = {
                        fullName: String(row.fullName || "").trim(),
                        phone: String(row.phone || "").trim(),
                        email: String(row.email || "").trim(),
                        completionDate: String(row.completionDate || "").trim(),
                    };

                    const rowErrors = [];

                    if (!candidate.fullName) {
                        rowErrors.push("Full name is required");
                    }

                    if (!/^\d{10}$/.test(candidate.phone)) {
                        rowErrors.push("Phone must contain exactly 10 digits");
                    }

                    if (
                        candidate.email &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)
                    ) {
                        rowErrors.push("Invalid email");
                    }



                    if (candidate.completionDate) {
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate.completionDate)) {
                            rowErrors.push("Date must use YYYY-MM-DD");
                        } else {
                            const parsedDate = new Date(
                                `${candidate.completionDate}T00:00:00.000Z`
                            );

                            if (
                                Number.isNaN(parsedDate.getTime()) ||
                                parsedDate.toISOString().slice(0, 10) !== candidate.completionDate
                            ) {
                                rowErrors.push("Invalid completion date");
                            }
                        }
                    }

                    if (candidate.phone && seenPhones.has(candidate.phone)) {
                        rowErrors.push("Duplicate phone number in CSV");
                    }

                    if (candidate.email) {
                        const normalizedEmail = candidate.email.toLowerCase();

                        if (seenEmails.has(normalizedEmail)) {
                            rowErrors.push("Duplicate email in CSV");
                        }
                    }

                    // Track values even if the row is invalid so duplicates
                    // are detected in later rows.
                    if (candidate.phone) {
                        seenPhones.add(candidate.phone);
                    }

                    if (candidate.email) {
                        seenEmails.add(candidate.email.toLowerCase());
                    }

                    if (rowErrors.length > 0) {
                        invalid.push({
                            row: csvRowNumber,
                            candidate,
                            errors: rowErrors,
                        });
                    } else {
                        valid.push(candidate);
                    }
                });

                if (results.errors.length > 0) {
                    setError("CSV parsing issues detected. Check the file format.");
                }

                setPreview(valid);
                setInvalidRows(invalid);
            },
            error: (parseError) => {
                setError(parseError.message || "Unable to parse CSV file");
            },
        });
    };

    const handleImport = () => {
        if (preview.length === 0) return;

        onImport(preview);

        setPreview([]);
        setInvalidRows([]);
        setError("");
        setFileName("");
    };



    return (
        <section className="csv-import">
            <h3>Import Candidates from CSV</h3>

            <p>
                Upload a CSV file to validate and preview candidates before
                adding them to your batch.
            </p>

            <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
            />

            {fileName && <p>Selected file: {fileName}</p>}

            {error && <div className="alert error">{error}</div>}

            {preview.length > 0 && (
                <>
                    <div className="csv-summary">
                        <p>Valid candidates: {preview.length}</p>
                        <p>Invalid rows: {invalidRows.length}</p>
                    </div>

                    <h4>Valid rows preview</h4>

                    <div className="csv-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Completion Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {preview.map((candidate, index) => (
                                    <tr key={`${candidate.phone}-${index}`}>
                                        <td>{candidate.fullName}</td>
                                        <td>{candidate.phone}</td>
                                        <td>{candidate.email || "-"}</td>
                                        <td>{candidate.completionDate || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button type="button" onClick={handleImport}>
                        Import {preview.length} Candidates
                    </button>
                </>
            )}

            {invalidRows.length > 0 && (
                <div className="invalid-rows">
                    <h4>Invalid rows</h4>

                    {invalidRows.map((item) => (
                        <div key={item.row} className="invalid-row">
                            <strong>Row {item.row}:</strong>{" "}
                            {item.candidate.fullName || "(Unnamed candidate)"}
                            <ul>
                                {item.errors.map((message, index) => (
                                    <li key={index}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default CandidateCsvImport;