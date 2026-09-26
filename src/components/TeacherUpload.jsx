import React, { useState, useCallback } from 'react'

function TeacherUpload() {
  const [inputMode, setInputMode] = useState('manual')
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const [manualTerms, setManualTerms] = useState([])
  const [currentTerm, setCurrentTerm] = useState('')
  const [currentDefinition, setCurrentDefinition] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setUploadStatus(null)
    } else {
      setUploadStatus({ type: 'error', message: 'Please upload a CSV file' })
    }
  }, [])

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus(null)
    setPreviewData(null)

    const formData = new FormData()
    formData.append('csvFile', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus({ type: 'success', message: `Successfully uploaded! Found ${data.termCount} terms.` })
        setPreviewData(data.preview)
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' })
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to connect to server' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setUploadStatus(null)
    setPreviewData(null)
  }

  const handleAddTerm = () => {
    if (!currentTerm.trim() || !currentDefinition.trim()) {
      setUploadStatus({ type: 'error', message: 'Please enter both a term and definition' })
      return
    }

    if (editingIndex !== null) {
      const updated = [...manualTerms]
      updated[editingIndex] = { term: currentTerm.trim(), definition: currentDefinition.trim() }
      setManualTerms(updated)
      setEditingIndex(null)
    } else {
      setManualTerms([...manualTerms, { term: currentTerm.trim(), definition: currentDefinition.trim() }])
    }
    
    setCurrentTerm('')
    setCurrentDefinition('')
    setUploadStatus({ type: 'success', message: 'Term added successfully!' })
    setTimeout(() => setUploadStatus(null), 2000)
  }

  const handleEditTerm = (index) => {
    setCurrentTerm(manualTerms[index].term)
    setCurrentDefinition(manualTerms[index].definition)
    setEditingIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTerm = (index) => {
    setManualTerms(manualTerms.filter((_, i) => i !== index))
    setUploadStatus({ type: 'success', message: 'Term deleted' })
    setTimeout(() => setUploadStatus(null), 2000)
  }

  const handleCancelEdit = () => {
    setCurrentTerm('')
    setCurrentDefinition('')
    setEditingIndex(null)
  }

  const handleSaveManualTerms = () => {
    if (manualTerms.length === 0) {
      setUploadStatus({ type: 'error', message: 'Please add at least one term' })
      return
    }
    setUploadStatus({ type: 'success', message: `Saved ${manualTerms.length} terms successfully!` })
    setPreviewData(manualTerms.slice(0, 5))
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Create Your Review Terms
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Add terms and definitions manually or upload a CSV file to get started.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border-2 border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setInputMode('manual')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                inputMode === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setInputMode('csv')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                inputMode === 'csv'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">{inputMode === 'manual' ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingIndex !== null ? 'Edit Term' : 'Add New Term'}
              </h3>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Term
                  </label>
                  <input
                    type="text"
                    value={currentTerm}
                    onChange={(e) => setCurrentTerm(e.target.value)}
                    placeholder="Enter the term (e.g., Photosynthesis)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Definition
                  </label>
                  <textarea
                    value={currentDefinition}
                    onChange={(e) => setCurrentDefinition(e.target.value)}
                    placeholder="Enter the definition"
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddTerm}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {editingIndex !== null ? 'Update Term' : 'Add Term'}
                  </button>
                  {editingIndex !== null && (
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {uploadStatus && (
                <div
                  className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
                    uploadStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {uploadStatus.type === 'success' ? (
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <p
                    className={`font-medium ${
                      uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {uploadStatus.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-xl transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="p-12 text-center">
                <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                  <svg
                    className={`w-20 h-20 transition-colors ${
                      isDragging ? 'text-blue-500' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>

                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3 text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-lg">{file.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xl font-semibold text-gray-700">
                      Drop your CSV file here
                    </p>
                    <p className="text-gray-500">or</p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {file ? 'Choose Different File' : 'Browse Files'}
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Accepts CSV files only
                </p>
              </div>
            </div>

            {uploadStatus && (
              <div
                className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
                  uploadStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {uploadStatus.type === 'success' ? (
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p
                  className={`font-medium ${
                    uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {uploadStatus.message}
                </p>
              </div>
            )}

            {file && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload & Process'
                  )}
                </button>
                <button
                  onClick={handleClear}
                  disabled={isUploading}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {inputMode === 'manual' && manualTerms.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Your Terms ({manualTerms.length})
              </h3>
              <button
                onClick={handleSaveManualTerms}
                className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Save All Terms
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {manualTerms.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-2">
                          {index + 1}. {item.term}
                        </div>
                        <div className="text-gray-600 pl-4 border-l-2 border-blue-300">
                          {item.definition}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditTerm(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTerm(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {previewData && previewData.length > 0 && inputMode === 'csv' && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Preview - First 5 Terms</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {previewData.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {item.term}
                    </div>
                    <div className="text-gray-600 pl-4 border-l-2 border-blue-300">
                      {item.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {inputMode === 'csv' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>First column: Term</li>
                  <li>Second column: Definition</li>
                  <li>Include a header row (e.g., "Term,Definition")</li>
                  <li>Each term should have exactly one definition</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherUpload
