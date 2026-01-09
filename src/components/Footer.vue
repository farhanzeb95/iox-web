<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="powered-by">
        <p>Powered by IOX</p>
      </div>
      <div class="copyright">
        <p>&copy; {{ new Date().getFullYear() }}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f8f9fa;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  width: 100%;
  z-index: 1000;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.powered-by {
  text-align: left;
}

.powered-by p {
  margin: 0;
  color: #42b983;
  font-size: 14px;
  font-weight: 600;
}

.copyright {
  text-align: right;
}

.copyright p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .powered-by,
  .copyright {
    text-align: center;
  }
}
</style>

