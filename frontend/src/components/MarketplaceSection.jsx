import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

function MarketplaceSection({ backendUrl, socket }) {
  const [allProducts, setAllProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentCardData, setCurrentCardData] = useState(null)
  const [cardPresent, setCardPresent] = useState(false)

  useEffect(() => {
    const handleCardScanned = (data) => {
      setCurrentCardData(data)
      setCardPresent(true)
    }

    const handleCardBalanceUpdated = (data) => {
      if (currentCardData && currentCardData.uid === data.uid) {
        setCurrentCardData({ ...currentCardData, balance: data.balance })
        toast.info(`Balance updated: $${data.balance.toFixed(2)}`)
      }
    }

    const handleCardRemoved = (data) => {
      if (currentCardData && currentCardData.uid === data.uid) {
        setCurrentCardData(null)
        setCardPresent(false)
      }
    }

    socket.on('card-status', handleCardScanned)
    socket.on('card-balance', handleCardBalanceUpdated)
    socket.on('card-removed', handleCardRemoved)

    return () => {
      socket.off('card-status', handleCardScanned)
      socket.off('card-balance', handleCardBalanceUpdated)
      socket.off('card-removed', handleCardRemoved)
    }
  }, [socket, currentCardData])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/products`, {
          headers: { authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (res.ok) {
          setAllProducts(await res.json())
        } else {
          setAllProducts([
            { id: 'coffee', name: 'Coffee', price: 2.50, iconSvg: '<span>☕</span>', category: 'food' },
            { id: 'sandwich', name: 'Sandwich', price: 5.00, iconSvg: '<span>🥪</span>', category: 'food' },
            { id: 'water', name: 'Water Bottle', price: 1.00, iconSvg: '<span>💧</span>', category: 'food' },
            { id: 'brochette', name: 'Brochette', price: 4.00, iconSvg: '<span>串</span>', category: 'rwandan' },
            { id: 'isombe', name: 'Isombe', price: 3.50, iconSvg: '<span>🥬</span>', category: 'rwandan' },
            { id: 'domain-com', name: '.com Domain', price: 12.00, iconSvg: '<span>🌐</span>', category: 'domains' },
            { id: 'domain-io', name: '.io Domain', price: 35.00, iconSvg: '<span>🌐</span>', category: 'domains' }
          ])
        }
      } catch {
        setAllProducts([
          { id: 'coffee', name: 'Coffee', price: 2.50, iconSvg: '<span>☕</span>', category: 'food' },
          { id: 'sandwich', name: 'Sandwich', price: 5.00, iconSvg: '<span>🥪</span>', category: 'food' },
          { id: 'water', name: 'Water Bottle', price: 1.00, iconSvg: '<span>💧</span>', category: 'food' },
          { id: 'brochette', name: 'Brochette', price: 4.00, iconSvg: '<span>串</span>', category: 'rwandan' },
          { id: 'isombe', name: 'Isombe', price: 3.50, iconSvg: '<span>🥬</span>', category: 'rwandan' },
          { id: 'domain-com', name: '.com Domain', price: 12.00, iconSvg: '<span>🌐</span>', category: 'domains' },
          { id: 'domain-io', name: '.io Domain', price: 35.00, iconSvg: '<span>🌐</span>', category: 'domains' }
        ])
      }
    }
    loadProducts()
  }, [backendUrl])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      } else {
        return [...prev, { product, qty: 1 }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const changeQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.qty + delta
        if (newQty <= 0) {
          return null
        }
        return { ...item, qty: newQty }
      }
      return item
    }).filter(Boolean))
  }

  const getCartTotal = () => cart.reduce((total, item) => total + (item.product.price * item.qty), 0)

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!currentCardData || !cardPresent || cart.length === 0) return
    const amount = getCartTotal()
    try {
      const res = await fetch(`${backendUrl}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ uid: currentCardData.uid, amount, description: 'Marketplace purchase' })
      })
      if (res.ok) {
        const data = await res.json()
        console.log('Purchase response:', data)
        toast.success('Purchase successful!')
        setCart([])
      } else {
        const errorData = await res.json()
        toast.error('Purchase failed: ' + (errorData.error || 'Unknown error'))
      }
    } catch {
      toast.error('Network error')
    }
  }

  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.qty, 0)

  const filteredProducts = selectedCategory === 'all' ? allProducts : allProducts.filter(p => p.category === selectedCategory)

  return (
    <div className="marketplace-layout">
      <div className="glass-card marketplace-products">
        <div className="marketplace-header">
          <h3>Available Products</h3>
          {getCartItemCount() > 0 && (
            <div className="cart-badge">{getCartItemCount()}</div>
          )}
        </div>

        <div className="category-filter">
          <button className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>All</button>
          <button className={`category-btn ${selectedCategory === 'food' ? 'active' : ''}`} onClick={() => setSelectedCategory('food')}>Food</button>
          <button className={`category-btn ${selectedCategory === 'rwandan' ? 'active' : ''}`} onClick={() => setSelectedCategory('rwandan')}>🇷🇼 Rwandan</button>
          <button className={`category-btn ${selectedCategory === 'drinks' ? 'active' : ''}`} onClick={() => setSelectedCategory('drinks')}>Drinks</button>
          <button className={`category-btn ${selectedCategory === 'domains' ? 'active' : ''}`} onClick={() => setSelectedCategory('domains')}>Domains</button>
          <button className={`category-btn ${selectedCategory === 'services' ? 'active' : ''}`} onClick={() => setSelectedCategory('services')}>Services</button>
        </div>

        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <span className="product-icon" dangerouslySetInnerHTML={{ __html: product.iconSvg || product.icon }} />
              <div className="product-name">{product.name}</div>
              <div className="product-price">${product.price.toFixed(2)}</div>
              <div className="product-add-hint">Click to add</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card shopping-cart">
        <h3>🛍️ Shopping Cart</h3>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <p className="cart-empty-hint">Click products to add them</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.product.name}</span>
                  <span className="cart-item-price">${item.product.price.toFixed(2)}</span>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => changeQty(item.product.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.product.id, 1)}>+</button>
                  <button onClick={() => removeFromCart(item.product.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-summary" style={{ fontSize: 'small', padding: '5px' }}>
            <div className="cart-summary-row cart-total-row">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        )}
        <button className="checkout-btn" disabled={cart.length === 0} onClick={handleCheckout}>
          <span className="btn-icon">💳</span> Checkout & Pay
        </button>
        <p className="checkout-hint">Scan your card first to enable checkout</p>
      </div>
    </div>
  )
}

export default MarketplaceSection
