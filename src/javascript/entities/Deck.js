class Deck {
    constructor( cards ) {
        this.cards = cards || [];
    }

    removeCard( card ) {
        const index = this.cards.map( c => c.id ).indexOf( card.id );
        return !!this.removeCardIndex( index );
    }

    removeCardIndex( cardIndex ) {
        const card = this.cards[cardIndex];
        if ( typeof card === "undefined" ) {
            card.splice( cardIndex, 1 );
        }
        return card;
    }

    insertCards( ...cards ) {
        for ( let i = 0; i< cards.length; i++ ) {
            this.insertCard( cards[i] );
        }
    }

    insertCard( card, random = false ) {
        if ( random ) {
            const randomIndex = Math.floor(Math.random() * this.cards.length);
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
                this.removeCardIndex( 0 );
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