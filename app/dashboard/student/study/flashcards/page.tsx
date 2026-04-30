'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as flashcardsService from '@/services/flashcards.service'
import type { FlashcardDeck, Flashcard } from '@/types/database.types'

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<{ deck: FlashcardDeck; cards: Flashcard[] } | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)

  // Form states
  const [deckTitle, setDeckTitle] = useState('')
  const [deckDesc, setDeckDesc] = useState('')
  const [cardFront, setCardFront] = useState('')
  const [cardBack, setCardBack] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await flashcardsService.getDecks()
      if (!cancelled && res.success && res.data) setDecks(res.data)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const loadDecks = async () => {
    const res = await flashcardsService.getDecks()
    if (res.success && res.data) setDecks(res.data)
  }

  const loadDeck = async (id: string) => {
    const res = await flashcardsService.getDeck(id)
    if (res.success && res.data) {
      setSelectedDeck({ deck: res.data, cards: res.data.cards ?? [] })
      setCurrentCardIndex(0)
      setIsFlipped(false)
    }
  }

  const handleCreateDeck = async () => {
    if (!deckTitle.trim()) return
    const res = await flashcardsService.createDeck(deckTitle, deckDesc, null, true)
    if (res.success) {
      setShowCreateModal(false)
      setDeckTitle('')
      setDeckDesc('')
      loadDecks()
    }
  }

  const handleAddCard = async () => {
    if (!selectedDeck || !cardFront.trim() || !cardBack.trim()) return
    const res = await flashcardsService.addCard(
      selectedDeck.deck.id,
      cardFront,
      cardBack,
      selectedDeck.cards.length
    )
    if (res.success) {
      loadDeck(selectedDeck.deck.id)
      setShowAddCardModal(false)
      setCardFront('')
      setCardBack('')
    }
  }

  const handleRateCard = async (rating: number) => {
    if (!selectedDeck) return
    const card = selectedDeck.cards[currentCardIndex]
    await flashcardsService.updateCardProgress(card.id, rating)
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'white', marginBottom: '4px' }}>
            Flashcards 🃏
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Create and review flashcard decks</p>
        </div>
        {selectedDeck && (
          <button
            onClick={() => { setSelectedDeck(null); setShowAddCardModal(true) }}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
              color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              marginRight: '12px',
            }}
          >
            + Add Card
          </button>
        )}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #4169E1, #2D4FC8)',
            color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + New Deck
        </button>
      </div>

      {selectedDeck ? (
        // Study Mode
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button
            onClick={() => setSelectedDeck(null)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem', cursor: 'pointer', marginBottom: '20px', padding: 0,
            }}
          >
            ← Back to Decks
          </button>

          <h2 style={{ color: 'white', marginBottom: '8px' }}>{selectedDeck.deck.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '24px' }}>
            Card {currentCardIndex + 1} of {selectedDeck.cards.length}
          </p>

          {/* Progress Bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '32px' }}>
            <div style={{
              height: '100%', borderRadius: '2px', transition: 'width 0.3s',
              width: `${((currentCardIndex + 1) / selectedDeck.cards.length) * 100}%`,
              background: 'linear-gradient(90deg, #9B59B6, #4169E1)',
            }} />
          </div>

          {selectedDeck.cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No cards yet. Add some cards to start studying!</p>
            </div>
          ) : (
            <>
              {/* Flashcard */}
              <motion.div
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '40px',
                  minHeight: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  perspective: '1000px',
                  marginBottom: '24px',
                }}
              >
                <div style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '1.3rem',
                  lineHeight: 1.6,
                  transform: isFlipped ? 'rotateY(180deg)' : 'none',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isFlipped ? 'Answer' : 'Question'}
                  </div>
                  {isFlipped ? selectedDeck.cards[currentCardIndex].back : selectedDeck.cards[currentCardIndex].front}
                </div>
              </motion.div>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginBottom: '24px' }}>
                Click to {isFlipped ? 'see question' : 'reveal answer'}
              </p>

              {/* Rating Buttons */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
                  >
                    {[
                      { label: 'Again', color: '#E74C3C', value: 0 },
                      { label: 'Hard', color: '#F39C12', value: 1 },
                      { label: 'Good', color: '#27AE60', value: 2 },
                      { label: 'Easy', color: '#4169E1', value: 3 },
                    ].map(r => (
                      <button
                        key={r.label}
                        onClick={() => handleRateCard(r.value)}
                        style={{
                          padding: '12px 24px', borderRadius: '10px', border: 'none',
                          background: `${r.color}20`, color: r.color,
                          fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      ) : (
        // Deck Grid
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {decks.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🃏</div>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No flashcard decks yet. Create one to get started!</p>
            </div>
          ) : (
            decks.map(deck => (
              <motion.div
                key={deck.id}
                whileHover={{ y: -4 }}
                onClick={() => loadDeck(deck.id)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                }}
              >
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'white', marginBottom: '8px' }}>
                  {deck.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                  {deck.description || 'No description'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                    {(deck as unknown as { card_count?: number }).card_count ?? 0} cards
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px',
                    background: deck.is_public ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: deck.is_public ? '#27AE60' : 'rgba(255,255,255,0.4)',
                    fontSize: '0.7rem', fontWeight: 600,
                  }}>
                    {deck.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>New Flashcard Deck</h2>
              <input value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} placeholder="Deck title *" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={deckDesc} onChange={(e) => setDeckDesc(e.target.value)} placeholder="Description (optional)" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreateDeck} disabled={!deckTitle.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: deckTitle.trim() ? 'linear-gradient(135deg, #9B59B6, #7D3C98)' : 'rgba(255,255,255,0.05)', color: deckTitle.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: deckTitle.trim() ? 'pointer' : 'default' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={() => { setShowAddCardModal(false); setCardFront(''); setCardBack('') }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'white', marginBottom: '24px' }}>Add Flashcard</h2>
              <textarea value={cardFront} onChange={(e) => setCardFront(e.target.value)} placeholder="Front (question) *" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '12px' }} />
              <textarea value={cardBack} onChange={(e) => setCardBack(e.target.value)} placeholder="Back (answer) *" rows={3} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: '16px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setShowAddCardModal(false); setCardFront(''); setCardBack('') }} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddCard} disabled={!cardFront.trim() || !cardBack.trim()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: cardFront.trim() && cardBack.trim() ? 'linear-gradient(135deg, #9B59B6, #7D3C98)' : 'rgba(255,255,255,0.05)', color: cardFront.trim() && cardBack.trim() ? 'white' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 600, cursor: cardFront.trim() && cardBack.trim() ? 'pointer' : 'default' }}>Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
