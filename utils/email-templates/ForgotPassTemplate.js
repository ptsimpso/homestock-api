module.exports = (password) => {
  return `
    <html>
      <body>
        <div style="text-align: center;">
          <h3>Password: ${password}</h3>
          <p>Please log in with your temporary password and then create a new one from your profile page.</p>
        </div>
      </body>
    </html>
  `;
}