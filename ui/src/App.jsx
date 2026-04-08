import { useMemo, useState } from 'react'
import './App.css'

const MENU_LIST = [
  {
    id: 'americano-ice',
    name: '아메리카노(ICE)',
    price: 4000,
    description: '산뜻하고 깔끔한 아이스 아메리카노',
    stock: 12,
  },
  {
    id: 'americano-hot',
    name: '아메리카노(HOT)',
    price: 4000,
    description: '진한 향이 살아있는 핫 아메리카노',
    stock: 8,
  },
  {
    id: 'cafe-latte',
    name: '카페라떼',
    price: 5000,
    description: '고소한 우유와 에스프레소의 조화',
    stock: 0,
  },
  {
    id: 'vanilla-latte',
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 향이 더해진 라떼',
    stock: 4,
  },
]

const OPTIONS = [
  { id: 'extra-shot', label: '샷 추가', price: 500 },
  { id: 'syrup', label: '시럽 추가', price: 0 },
]

const formatPrice = (value) => `${value.toLocaleString('ko-KR')}원`

function App() {
  const [selectedOptionsByMenu, setSelectedOptionsByMenu] = useState({})
  const [cartItems, setCartItems] = useState([])

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.linePrice * item.quantity, 0),
    [cartItems],
  )

  const toggleOption = (menuId, optionId) => {
    setSelectedOptionsByMenu((prev) => {
      const current = prev[menuId] ?? []
      const hasOption = current.includes(optionId)
      const nextOptions = hasOption
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]

      return {
        ...prev,
        [menuId]: nextOptions,
      }
    })
  }

  const addToCart = (menu) => {
    if (menu.stock <= 0) {
      return
    }

    const selectedOptionIds = [...(selectedOptionsByMenu[menu.id] ?? [])].sort()
    const selectedOptionData = OPTIONS.filter((opt) =>
      selectedOptionIds.includes(opt.id),
    )
    const optionsPrice = selectedOptionData.reduce((sum, opt) => sum + opt.price, 0)
    const linePrice = menu.price + optionsPrice
    const cartKey = `${menu.id}::${selectedOptionIds.join('|')}`

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartKey === cartKey)
      if (existingIndex < 0) {
        return [
          ...prev,
          {
            cartKey,
            menuId: menu.id,
            name: menu.name,
            optionLabels: selectedOptionData.map((opt) => opt.label),
            quantity: 1,
            linePrice,
          },
        ]
      }

      return prev.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
      )
    })
  }

  const changeQuantity = (cartKey, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartKey !== cartKey) {
          return item
        }
        const nextQuantity = item.quantity + delta
        if (nextQuantity < 1) {
          return item
        }
        return { ...item, quantity: nextQuantity }
      }),
    )
  }

  const removeCartItem = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey))
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      window.alert('장바구니가 비어 있습니다.')
      return
    }

    // 데모용 실패 시나리오: 실패하면 장바구니 유지
    const isSuccess = Math.random() > 0.4
    if (isSuccess) {
      window.alert('주문이 접수되었습니다.')
      setCartItems([])
      return
    }

    window.alert('주문에 실패했습니다. 장바구니를 유지합니다.')
  }

  return (
    <div className="app">
      <header className="top-nav">
        <div className="brand">COZY</div>
        <nav className="nav-menu" aria-label="주요 메뉴">
          <button type="button" className="nav-button active">
            주문하기
          </button>
          <button type="button" className="nav-button">
            관리자
          </button>
        </nav>
      </header>

      <main>
        <section className="menu-grid" aria-label="커피 메뉴 목록">
          {MENU_LIST.map((menu) => {
            const selectedOptionIds = selectedOptionsByMenu[menu.id] ?? []
            return (
              <article className="menu-card" key={menu.id}>
                <img
                  className="menu-image"
                  src="/coffee-menu.jpg"
                  alt={`${menu.name} 이미지`}
                />
                <h2>{menu.name}</h2>
                <p className="menu-price">{formatPrice(menu.price)}</p>
                <p className="menu-description">{menu.description}</p>

                <div className="option-list">
                  {OPTIONS.map((option) => (
                    <label key={option.id}>
                      <input
                        type="checkbox"
                        checked={selectedOptionIds.includes(option.id)}
                        onChange={() => toggleOption(menu.id, option.id)}
                      />
                      <span>
                        {option.label} (+{formatPrice(option.price)})
                      </span>
                    </label>
                  ))}
                </div>

                {menu.stock > 0 ? (
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => addToCart(menu)}
                  >
                    담기
                  </button>
                ) : (
                  <p className="sold-out">품절</p>
                )}
              </article>
            )
          })}
        </section>

        <section className="cart-panel" aria-label="장바구니">
          <div className="cart-left">
            <h3>장바구니</h3>
            {cartItems.length === 0 ? (
              <p className="empty-cart">담긴 메뉴가 없습니다.</p>
            ) : (
              <ul className="cart-list">
                {cartItems.map((item) => {
                  const optionText = item.optionLabels.length
                    ? ` (${item.optionLabels.join(', ')})`
                    : ''
                  return (
                    <li key={item.cartKey}>
                      <div className="cart-item-main">
                        <span className="cart-name">
                          {item.name}
                          {optionText}
                        </span>
                        <span className="cart-line-price">
                          {formatPrice(item.linePrice * item.quantity)}
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-wrap">
                          <span className="quantity-label">수량</span>
                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() => changeQuantity(item.cartKey, -1)}
                            disabled={item.quantity === 1}
                            aria-label={`${item.name} 수량 감소`}
                          >
                            ◀
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="quantity-button"
                            onClick={() => changeQuantity(item.cartKey, 1)}
                            aria-label={`${item.name} 수량 증가`}
                          >
                            ▶
                          </button>
                        </div>
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => removeCartItem(item.cartKey)}
                          aria-label={`${item.name} 삭제`}
                        >
                          X
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="cart-right">
            <p className="total-label">총 금액</p>
            <p className="total-price">{formatPrice(totalPrice)}</p>
            <button
              type="button"
              className="action-button order-button"
              onClick={handleOrder}
            >
              주문하기
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
