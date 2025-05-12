import { useState, useEffect } from "react";
import { Container, Button, Form, Card, Alert, Spinner } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import "../styles/JwtTestPage.css";

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

const JwtTestPage = () => {
  // State for login form
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for token information
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);

  // State for API test
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("/users/me/profile");

  // Decode token on component mount or when token changes
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token) as DecodedToken;
        setDecodedToken(decoded);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setDecodedToken(null);
      }
    } else {
      setDecodedToken(null);
    }
  }, [token]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          usernameOrEmail, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store and set the JWT token
      localStorage.setItem("token", data.token);
      setToken(data.token);

      setUsernameOrEmail("");
      setPassword("");
    } catch (err: any) {
      setError("Invalid username/email or password");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setDecodedToken(null);
    setApiResponse(null);
  };

  // Test protected API
  const testProtectedApi = async () => {
    setApiError("");
    setApiLoading(true);

    try {
      const response = await fetch(`http://localhost:8080${selectedEndpoint}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiError(err.message || "Failed to access protected API");
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">JWT Authentication Test Page</h1>

      <div className="row">
        {/* Login Form */}
        <div className="col-md-6 mb-4">
          <Card className="test-card">
            <Card.Header className="test-card-header">Login Test</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {token ? (
                <div>
                  <Alert variant="success">You are logged in!</Alert>
                  <Button 
                    variant="danger" 
                    onClick={handleLogout}
                    className="w-100"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email or Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" /> Logging in...
                      </>
                    ) : "Login"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Token Information */}
        <div className="col-md-6 mb-4">
          <Card className="test-card">
            <Card.Header className="test-card-header">Token Information</Card.Header>
            <Card.Body>
              {token ? (
                <div>
                  <h5>Raw Token:</h5>
                  <div className="token-display mb-3">
                    {token}
                  </div>

                  <h5>Decoded Token:</h5>
                  <div className="decoded-token mb-3">
                    <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
                  </div>

                  <div className="mb-3">
                    <strong>Subject:</strong> {decodedToken?.sub}
                  </div>

                  <div className="mb-3">
                    <strong>Expiration:</strong> {decodedToken?.exp ? 
                      new Date(decodedToken.exp * 1000).toLocaleString() : 'N/A'}
                  </div>

                  <div className="mb-3">
                    <strong>Issued At:</strong> {decodedToken?.iat ? 
                      new Date(decodedToken.iat * 1000).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ) : (
                <Alert variant="warning">
                  No token available. Please log in first.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Protected API Test */}
        <div className="col-12">
          <Card className="test-card">
            <Card.Header className="test-card-header">Protected API Test</Card.Header>
            <Card.Body>
              {apiError && <Alert variant="danger">{apiError}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Select Endpoint to Test</Form.Label>
                <Form.Select 
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  disabled={!token || apiLoading}
                >
                  <option value="/users/me">User Data</option>
                  <option value="/users/me/profile">User Profile</option>
                  <option value="/users/me/profilePicture">Profile Picture</option>
                  <option value="/users/me/interestsVector">Interest Vector</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Testing endpoint: <code>http://localhost:8080{selectedEndpoint}</code>
                </Form.Text>
              </Form.Group>

              <Button 
                variant="primary" 
                onClick={testProtectedApi}
                disabled={!token || apiLoading}
                className="mb-3"
              >
                {apiLoading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Testing API...
                  </>
                ) : "Test Protected API"}
              </Button>

              {apiResponse && (
                <div>
                  <h5>API Response:</h5>
                  <div className="api-response">
                    <pre>{apiResponse}</pre>
                  </div>
                </div>
              )}

              {!token && (
                <Alert variant="warning">
                  You need to log in first to test the protected API.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default JwtTestPage;
