export const downloadSvg = (name: string, svgContent: string) => {
  // Create a Blob from the SVG content
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  // Create a link element
  const link = document.createElement("a");
  // Create a URL for the Blob and set it as the href attribute
  const url = URL.createObjectURL(blob);
  link.href = url;
  // Set the download attribute to specify the file name
  link.download = `${name}.svg`;
  // Append the link to the body temporarily
  document.body.appendChild(link);
  // Trigger the download by simulating a click
  link.click();
  // Clean up and remove the link
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
