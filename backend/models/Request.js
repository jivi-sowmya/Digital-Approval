const createRequestsTableQuery = `
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  employee_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  employee_name VARCHAR(255),
  employee_email VARCHAR(255),
  type VARCHAR(100),
  from_date VARCHAR(50),
  to_date VARCHAR(50),
  purchase_date VARCHAR(50),
  amount VARCHAR(50),
  loan_type VARCHAR(100),
  loan_amount VARCHAR(50),
  document_proofs LONGTEXT,
  manager_comment TEXT,
  manager_comment_updated_at VARCHAR(100),
  INDEX idx_requests_employee_created (employee_id, created_at DESC),
  INDEX idx_requests_status_created (status, created_at DESC),
  INDEX idx_requests_type_created (type, created_at DESC),
  CONSTRAINT fk_requests_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

module.exports = {
  createRequestsTableQuery
};
