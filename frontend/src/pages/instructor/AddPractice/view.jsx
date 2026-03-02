import React, { useState } from "react";
import { ArrowLeft, Save, Code, CheckCircle, Trash2, Plus, Upload, Download, FileText } from "lucide-react";
import Editor from "@monaco-editor/react";

const AddPracticeView = ({
  formData,
  handleChange,
  handleCodeChange,
  handleTestCaseChange,
  addTestCase,
  removeTestCase,
  toggleTestCaseVisibility,
  handleSubmit,
  navigate,
  loading,
  // Bulk upload props
  activeTab,
  setActiveTab,
  csvFile,
  handleFileChange,
  handleBulkUpload,
  bulkUploadLoading,
  bulkUploadResults,
  downloadTemplate,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-primary-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 px-8 py-4 flex items-center justify-between shadow-lg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/instructor/practice")}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Code size={20} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                New Coding Challenge
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Create a practice problem for students
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save size={18} /> Publish Challenge
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mt-8 px-8">
        <div className="bg-white rounded-lg border border-slate-200 p-1 inline-flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all ${activeTab === "manual"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === "bulk"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Upload size={16} />
            Bulk Upload CSV
          </button>
        </div>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metadata */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                Basic Info
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Two Sum"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Problem statement..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-indigo-500 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-xs">
              <strong>Note:</strong> Public test cases are shown to students
              immediately. Hidden test cases are run only upon submission.
            </div>
          </div>

          {/* Right Column: Code & Test Cases */}
          <div className="space-y-6 lg:col-span-2">
            {/* Starter Code */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                  Starter Code
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                  JavaScript
                </span>
              </div>
              <div className="h-64">
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={formData.starter_code}
                  onChange={handleCodeChange}
                  theme="light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                  Test Cases
                </h3>
                <button
                  onClick={addTestCase}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <Plus size={14} /> Add Case
                </button>
              </div>

              <div className="space-y-3">
                {formData.test_cases.map((tc, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-white text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0 mt-1">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Input (Args)
                        </label>
                        <input
                          value={tc.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          placeholder="e.g. [2, 7, 11, 15], 9"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Expected Output
                        </label>
                        <input
                          value={tc.output} // Using 'output' matching backend field expectation for JSON
                          onChange={(e) =>
                            handleTestCaseChange(index, "output", e.target.value)
                          }
                          placeholder="e.g. [0, 1]"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-5">
                      <button
                        onClick={() => toggleTestCaseVisibility(index)}
                        className={`p-1.5 rounded transition-colors flex items-center justify-center gap-1 text-[10px] font-bold uppercase w-20 
        ${tc.isPublic
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        title={
                          tc.isPublic
                            ? "Click to make Hidden"
                            : "Click to make Public"
                        }
                      >
                        {tc.isPublic ? (
                          <>
                            <Code size={12} /> Public
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} /> Hidden
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => removeTestCase(index)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 self-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.test_cases.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm italic">
                    No test cases added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Tab */}
      {activeTab === "bulk" && (
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <FileText className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Bulk Upload Challenges
              </h2>
              <p className="text-slate-600 text-sm">
                Upload multiple challenges at once using a CSV file
              </p>
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Download className="text-blue-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">
                    Download CSV Template
                  </h3>
                  <p className="text-blue-700 text-xs mb-3">
                    Use this template to format your challenges correctly
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <Upload className="text-slate-400 mb-3" size={40} />
                  <span className="text-sm font-semibold text-slate-700 mb-1">
                    Click to upload CSV file
                  </span>
                  <span className="text-xs text-slate-500">
                    or drag and drop
                  </span>
                </label>
              </div>
              {csvFile && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-indigo-600" />
                  <span className="font-medium text-slate-700">
                    {csvFile.name}
                  </span>
                  <span className="text-slate-500">
                    ({(csvFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleBulkUpload}
              disabled={!csvFile || bulkUploadLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {bulkUploadLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Challenges
                </>
              )}
            </button>

            {/* Results Display */}
            {bulkUploadResults && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Upload Results
                </h3>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-slate-800">
                      {bulkUploadResults.summary.total}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wide">
                      Total Rows
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {bulkUploadResults.summary.successful}
                    </div>
                    <div className="text-xs text-green-700 uppercase tracking-wide">
                      Successful
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {bulkUploadResults.summary.failed}
                    </div>
                    <div className="text-xs text-red-700 uppercase tracking-wide">
                      Failed
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {bulkUploadResults.errors && bulkUploadResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 text-sm mb-2">
                      Errors ({bulkUploadResults.errors.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {bulkUploadResults.errors.map((err, idx) => (
                        <div key={idx} className="text-xs bg-white p-3 rounded border border-red-200">
                          <div className="font-semibold text-red-800 mb-1">
                            Row {err.row}: {err.error}
                          </div>
                          <div className="text-slate-600 font-mono">
                            Title: {err.data.title || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success message */}
                {bulkUploadResults.summary.successful > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-green-800 text-sm font-medium">
                      ✓ Successfully uploaded {bulkUploadResults.summary.successful} challenge(s)!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPracticeView;
