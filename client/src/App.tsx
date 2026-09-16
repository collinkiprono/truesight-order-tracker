import { useState } from "react";
import { Login } from "./Login";
import { OrdersList } from "./OrdersList";
import { OrderDetail } from "./OrderDetail";

function App() {
  const [token, setToken] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div>
      <h1>Truesight Order Tracker</h1>
      {selectedOrderId === null ? (
        <OrdersList token={token} onSelectOrder={setSelectedOrderId} />
      ) : (
        <OrderDetail
          token={token}
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

export default App;
