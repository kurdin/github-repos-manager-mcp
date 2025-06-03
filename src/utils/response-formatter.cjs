/**
 * Utility to format handler responses for MCP compatibility
 */

/**
 * Converts a handler response to MCP format
 * @param {Object} response - The response from a handler
 * @param {boolean} response.success - Whether the operation was successful
 * @param {*} response.data - The data returned by the operation
 * @param {string} response.message - A message about the operation
 * @param {string} response.error - Error details if any
 * @returns {Object} MCP-formatted response
 */
function formatHandlerResponse(response) {
  if (!response || typeof response !== 'object') {
    return {
      content: [{ type: "text", text: "Invalid response format" }],
      isError: true
    };
  }

  // If already in MCP format, return as-is
  if (response.content && Array.isArray(response.content)) {
    return response;
  }

  // Handle error responses
  if (response.success === false || response.error) {
    return {
      content: [{ 
        type: "text", 
        text: response.message || response.error || "Operation failed" 
      }],
      isError: true
    };
  }

  // Handle success responses
  if (response.success === true) {
    let text = "";
    
    if (response.message) {
      text = response.message;
    }
    
    if (response.data) {
      if (typeof response.data === 'string') {
        text = text ? `${text}\n\n${response.data}` : response.data;
      } else if (Array.isArray(response.data)) {
        // Format arrays more nicely
        if (response.data.length === 0) {
          text = text ? `${text}\n\nNo items found.` : "No items found.";
        } else {
          const formattedItems = response.data.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              // Format objects in arrays
              const keys = Object.keys(item);
              const formatted = keys.map(key => `  ${key}: ${JSON.stringify(item[key])}`).join('\n');
              return `[${index + 1}]\n${formatted}`;
            }
            return `[${index + 1}] ${JSON.stringify(item)}`;
          }).join('\n\n');
          text = text ? `${text}\n\n${formattedItems}` : formattedItems;
        }
      } else if (typeof response.data === 'object') {
        // Format objects more nicely
        const formatted = Object.entries(response.data)
          .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
          .join('\n');
        text = text ? `${text}\n\n${formatted}` : formatted;
      }
    }
    
    if (!text) {
      text = "Operation completed successfully";
    }
    
    return {
      content: [{ type: "text", text }]
    };
  }

  // Default case - try to format whatever we have
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify(response, null, 2) 
    }]
  };
}

module.exports = {
  formatHandlerResponse
};