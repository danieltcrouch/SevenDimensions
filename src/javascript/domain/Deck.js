class Deck {
    constructor( cards ) {
        this.cards = Array.isArray( cards ) ? cards.slice() : [];
    }

    static getCurrentDeck( deck, playerHands ) {
        deck = ( deck instanceof Deck ) ? deck : new Deck( deck );
        return new Deck( deck.cards.filter( c => !playerHands.flat().includes( c.id ) ) );
    }

    getRandomCards( count ) {
        let result = [];
        for ( let i = 0; i < count; i++ ) {
            const card = this.removeCardByIndex( Math.floor(Math.random() * this.cards.length) );
            if ( card ) {
                result.push( card );
            }
        }
        return result;
    }

    hasCard( card ) {
        return this.getCardIndex( card ) !== -1;
    }

    getCardIndex( card ) {
        return this.cards.map( c => c.id ).indexOf( card.id );
    }

    getCardByIndex( cardIndex ) {
        let card = undefined;
        if ( cardIndex >= 0 && cardIndex < this.getCount() ) {
            card = this.cards[cardIndex];
        }
        return card;
    }

    removeCard( card ) {
        return Boolean( this.removeCardByIndex( this.getCardIndex( card ) ) );
    }

    removeCardByIndex( cardIndex ) {
        let card = undefined;
        if ( cardIndex >= 0 && cardIndex < this.getCount() ) {
            card = this.cards.splice( cardIndex, 1 )[0];
        }
        return card;
    }

    insertCards( ...cards ) {
        this.cards.push( cards );
    }

    insertCard( card, random = false ) {
        if ( random ) {
            const randomIndex = Math.floor(Math.random() * (this.cards.length + 1));
            this.cards.splice( randomIndex, 0, card );
        }
        else {
            this.cards.push( card );
        }
    }

    getTopCard() {
        return this.popCards( 1 );
    }

    popCards( count ) {
        let cards = [];
        if ( count <= this.getCount() ) {
            for ( let i = 0; i < count; i++ ) {
                cards.push( this.cards[0] );
                this.removeCardByIndex( 0 );
            }
        }
        return cards;
    }

    shuffle() {
        for ( let i = this.cards.length - 1; i > 0; i-- ) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    getCount() {
        return this.cards.length
    }
}