/*** CHANGE TILES ***/


function swapDistrict( fromPlayer, toPlayer, tileId ) {
    removeDistrict( fromPlayer, tileId );
    addDistrict( toPlayer, tileId );
}

function addDistrict( player, tileId ) {
    player.districts.tileIds.push( tileId );
    colorElement( `${tileId}-background`, getColorFromPlayerId( player.id ), isImageTile(tileId) );
}

function removeDistrict( player, tileId ) {
    let tiles = player.districts.tileIds;
    tiles.splice( tiles.indexOf( tileId ), 1 );
    colorElement( `${tileId}-background`, getColorFromPlayerId( player.id ), isImageTile(tileId) );
}

function addReligion( player, tileId ) {
    player.religion.tileIds.push( tileId );
    const tileDetails = getTileDetails( tileId );
    updateReligionIcons( tileId, tileDetails.religionIds, tileDetails.districtPlayerId );
}

function removeReligion( player, tileId ) {
    let tiles = player.religion.tileIds;
    tiles.splice( tiles.indexOf( tileId ), 1 ); //todo 5 - add array remove to Common (be able to handle primitives and objects) (do a removeAll)
    const tileDetails = getTileDetails( tileId );
    updateReligionIcons( tileId, tileDetails.religionIds, tileDetails.districtPlayerId );
}


/*** HIGHLIGHT TILES ***/


function highlightSelectedTile( tileId, isHighlighted = true ) {
    const points = isHighlighted ? id( tileId + "-border" ).getAttributeNS(null, "points") : "";
    id( "selected-polygon" ).setAttributeNS(null, "points", points );
}

function highlightSuggestedTiles( tileIds, isHighlighted = true ) {
    if ( isHighlighted ) {
        for ( let i = 0; i < tileIds.length; i++ ) {
            show( "move-polygon-" + i );
            id( "move-polygon-" + i ).setAttributeNS(null, "points", id(tileIds[i] + "-background").getAttributeNS(null, "points") );
        }
    }
    else {
        nm('move-polygon').forEach( p => hide( p ) );
    }
}


/*** LOAD EXISTING MAP ***/


function fillTile( tile, districtPlayerId ) {
    id(tile.id + "-text").innerHTML = tile.getTileType().value + "";

    if ( tile.tileTypeId === TILE_TYPES[ATLANTIS].id ) {
        hideById(tile.id + "-text");
        id(tile.id + "-background").setAttributeNS(null, "fill", "url(#atlantis)");
    }
    else if ( tile.tileTypeId === TILE_TYPES[VOLCANO].id ) {
        hideById(tile.id + "-text");
        id(tile.id + "-background").setAttributeNS(null, "fill", "url(#volcano)");
    }
    else if ( tile.tileTypeId === TILE_TYPES[CAPITAL].id ) {
        hideById(tile.id + "-text");
        const factionId = getPlayer( districtPlayerId ).factionId;
        id(tile.id + "-background").setAttributeNS(null, "fill", `url(#faction${factionId})`);
    }

    if ( districtPlayerId ) {
        colorElement( `${tile.id}-background`, getColorFromPlayerId( districtPlayerId ), isImageTile(tile.id) );
    }
}

function addTileIcons( tile, tileDetails ) {
    updateUnitIcons( tile.id, tileDetails.unitSets, !!tileDetails.districtPlayerId, tileDetails.controlPlayerId );
    updateWonderIcons( tile.id, tileDetails.wonderId );
    updateResourceIcons( tile.id, tileDetails.resourceIds );
    updateReligionIcons( tile.id, tileDetails.religionIds, tileDetails.districtPlayerId );
    updateInitiativeIcons( tileDetails.politicalInitiatives );
}

function updateUnitIconsFromId( tileId ) {
    const tileDetails = getTileDetails( tileId );
    updateUnitIcons( tileId, tileDetails.unitSets, !!tileDetails.districtPlayerId, tileDetails.controlPlayerId );
}

function updateUnitIcons( tileId, unitSets, isDistrict, controlPlayerId ) {
    const unitSet = unitSets.find( set => set.id === controlPlayerId );
    const unitIds = unitSet ? unitSet.units.map( u => u.id ) : [];
    const normalUnitIds = unitIds.filter( id => id !== UNIT_TYPES[HERO].id );
    const isMultipleUnits = unitSets.reduce( ( units, set ) => units.concat( set.units ), [] ).length > 1;
    const isNonHeroUnits = !!normalUnitIds.length;
    if ( isNonHeroUnits ) {
        const strongestUnitId = Math.max( ...normalUnitIds );
        id(tileId + "-unit").setAttributeNS(null, "fill", `url(#unit${strongestUnitId})`);
    }
    const isHeroUnit = unitIds.includes( UNIT_TYPES[HERO].id );
    if ( isHeroUnit ) {
        const heroId = Faction.getHero( getPlayer( controlPlayerId ).factionId ).id;
        id(tileId + "-hero").setAttributeNS(null, "fill", `url(#hero${heroId})`);
    }

    const color = isDistrict ? null : getColorFromPlayerId( controlPlayerId );
    show( tileId + "-unit", isNonHeroUnits );
    show( tileId + "-unit-plus", isNonHeroUnits && isMultipleUnits );
    colorElement( `${tileId}-unit`, color, true );
    show( tileId + "-hero", isHeroUnit );
    colorElement( `${tileId}-hero`, color, true );
}

function updateWonderIcons( tileId, wonderId ) {
    show( tileId + "-wonder", !!wonderId );
    if ( wonderId ) {
        id(tileId + "-wonder").setAttributeNS(null, "fill", `url(#won${wonderId})`);
    }
}

function updateResourceIcons( tileId, resourceIds ) {
    const isResourcePresent = Array.isArray( resourceIds ) && resourceIds.length;
    show( tileId + "-resource", isResourcePresent );
    if ( isResourcePresent ) {
        const resourceId = resourceIds.length > 1 ? "All" : resourceIds[0];
        id(tileId + "-resource").setAttributeNS(null, "fill", `url(#res${resourceId})`);
    }
}

function updateReligionIcons( tileId, religionIds, districtPlayerId ) {
    const isReligionPresent = Array.isArray( religionIds ) && religionIds.length;
    show( tileId + "-religion", isReligionPresent );
    if ( isReligionPresent ) {
        const playerReligion = districtPlayerId ? getPlayer( districtPlayerId ).religion : null;
        const playerReligionId = playerReligion ? playerReligion.id : null;
        const religionId = religionIds.includes( playerReligionId ) ? playerReligionId : religionIds[0];
        id(tileId + "-religion").setAttributeNS(null, "fill", `url(#rel${religionId})`);
    }
}

function updateInitiativeIcons( politicalInitiatives ) {
    if ( Array.isArray( politicalInitiatives ) && politicalInitiatives.length ) {
        politicalInitiatives.forEach( token => show( getInitTokenIconId( token ) ) );
    }
}


/*** GENERATE BASE MAP ***/


function generateMapSVG( callbackFunction ) {
    let svg = id( "map" );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    const viewBoxWidth = (TILE_SIDE_LENGTH * 1.5 * maxTileDepth); //point-to-point hexagon height
    const viewBoxHeight = (TILE_SIDE_LENGTH * Math.sqrt( 3 ) * maxTileDepth); //flat hexagon height
    svg.setAttributeNS(null, "viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight );

    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, TILE_SIDE_LENGTH );
    for ( let i = 0; i < maxTileDepth; i++ ) {
       for ( let j = 0; j < maxTileDepth; j++ ) {
           const hex = new Hex( i, j, TILE_SIDE_LENGTH );
           if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
               let tile = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
               tile.setAttributeNS(null, "id", hex.id );
               tile.setAttributeNS(null, "onclick", callbackFunction.name + "('" + hex.id + "')" );
               tile.classList.add( "tile" );

               //todo 8 - image not working on phone - svg filter is the problem
               let background = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
               background.setAttributeNS(null, "id", hex.id + "-background" );
               background.setAttributeNS(null, "points", hex.vertices.map( p => (p.x + "," + p.y) ).join(" ") );
               background.classList.add( "tileBackground" );
               tile.appendChild( background );

               let border = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
               border.setAttributeNS(null, "id", hex.id + "-border" );
               border.setAttributeNS(null, "fill", "none" );
               border.setAttributeNS(null, "points", hex.vertices.map( p => (p.x + "," + p.y) ).join(" ") );
               tile.appendChild( border );

               let text = document.createElementNS( "http://www.w3.org/2000/svg", "text" );
               text.setAttributeNS(null, "id", hex.id + "-text" );
               text.setAttributeNS(null, "x", hex.midPoint.x );
               text.setAttributeNS(null, "y", hex.midPoint.y );
               text.setAttributeNS(null, "class", "tileText" );
               text.innerHTML = "" + j;
               tile.appendChild( text );

               const X_OFFSET = (TILE_SIDE_LENGTH / 2) - (TILE_SIDE_LENGTH * .1);
               const Y_OFFSET = (TILE_SIDE_LENGTH / 2) + (TILE_SIDE_LENGTH * .1);

               let iconWonder = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconWonder.setAttributeNS(null, "id", hex.id + "-wonder" );
               iconWonder.setAttributeNS(null, "cx", hex.midPoint.x - X_OFFSET );
               iconWonder.setAttributeNS(null, "cy", hex.midPoint.y - Y_OFFSET );
               iconWonder.setAttributeNS(null, "fill", "url(#won0)");
               iconWonder.classList.add( "tileIcon" );
               hide( iconWonder );
               tile.appendChild( iconWonder );

               let iconCamelot = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconCamelot.setAttributeNS(null, "id", hex.id + "-camelot" );
               iconCamelot.setAttributeNS(null, "cx", hex.midPoint.x - 0 );
               iconCamelot.setAttributeNS(null, "cy", hex.midPoint.y - Y_OFFSET );
               iconCamelot.setAttributeNS(null, "fill", "url(#cam)");
               iconWonder.classList.add( "tileIcon" );
               hide( iconCamelot );
               tile.appendChild( iconCamelot );

               let iconResource = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconResource.setAttributeNS(null, "id", hex.id + "-resource" );
               iconResource.setAttributeNS(null, "cx", hex.midPoint.x + X_OFFSET );
               iconResource.setAttributeNS(null, "cy", hex.midPoint.y - Y_OFFSET );
               iconResource.setAttributeNS(null, "fill", "url(#res0)");
               iconResource.classList.add( "tileIcon" );
               hide( iconResource );
               tile.appendChild( iconResource );

               let iconUnit = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconUnit.setAttributeNS(null, "id", hex.id + "-unit" );
               iconUnit.setAttributeNS(null, "cx", hex.midPoint.x - X_OFFSET );
               iconUnit.setAttributeNS(null, "cy", hex.midPoint.y + Y_OFFSET );
               iconUnit.setAttributeNS(null, "fill", "url(#unit0)");
               iconUnit.classList.add( "tileIcon" );
               hide( iconUnit );
               tile.appendChild( iconUnit );
               addPlusSymbol( tile, iconUnit );

               let iconHero = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconHero.setAttributeNS(null, "id", hex.id + "-hero" );
               iconHero.setAttributeNS(null, "cx", hex.midPoint.x + 0 );
               iconHero.setAttributeNS(null, "cy", hex.midPoint.y + Y_OFFSET );
               iconHero.setAttributeNS(null, "fill", "url(#hero0)");
               iconHero.classList.add( "tileIcon" );
               hide( iconHero );
               tile.appendChild( iconHero );

               let iconReligion = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
               iconReligion.setAttributeNS(null, "id", hex.id + "-religion" );
               iconReligion.setAttributeNS(null, "cx", hex.midPoint.x + X_OFFSET );
               iconReligion.setAttributeNS(null, "cy", hex.midPoint.y + Y_OFFSET );
               iconReligion.setAttributeNS(null, "fill", "url(#rel0)");
               iconReligion.classList.add( "tileIcon" );
               hide( iconReligion );
               tile.appendChild( iconReligion );
               addPlusSymbol( tile, iconReligion );

               const toHexes = getRelevantAdjacentHexes( hex ).filter( h => isInitTokenMasterHex( hex, h ) );
               toHexes.forEach( function( toHex ) {
                   let toHexSide = new Hex( toHex.x, toHex.y, TILE_SIDE_LENGTH );
                   let initiativeToken = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
                   initiativeToken.setAttributeNS(null, "id", hex.id + "-" + toHexSide.id + "-token" );
                   initiativeToken.setAttributeNS(null, "cx", (hex.midPoint.x + toHexSide.midPoint.x) / 2 );
                   initiativeToken.setAttributeNS(null, "cy", (hex.midPoint.y + toHexSide.midPoint.y) / 2 );
                   initiativeToken.setAttributeNS(null, "fill", "url(#init)");
                   initiativeToken.classList.add( "tileIcon" );
                   hide( initiativeToken );
                   tile.appendChild( initiativeToken );
               } );

               svg.appendChild( tile );
           }
       }
    }

    for ( let i = 0; i < (MAP_TILE_RADIUS * 6); i++ ) {
        let moveShape = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
        moveShape.setAttributeNS(null, "id", "move-polygon-" + i );
        moveShape.setAttributeNS(null, "name", "move-polygon" );
        moveShape.setAttributeNS(null, "fill", "transparent");
        moveShape.classList.add( "tile" );
        moveShape.style.stroke = "darkred";
        moveShape.style.fill = "none";
        svg.appendChild( moveShape );
    }

    let selectedShape = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
    selectedShape.setAttributeNS(null, "id", "selected-polygon" );
    selectedShape.setAttributeNS(null, "fill", "transparent");
    selectedShape.classList.add( "tile" );
    selectedShape.style.stroke = "gold";
    selectedShape.style.fill = "none";
    svg.appendChild( selectedShape );
}

function addPlusSymbol( tile, icon ) {
    let plus = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
    plus.setAttributeNS(null, "id", icon.getAttributeNS( null, "id" ) + "-plus" );
    plus.setAttributeNS(null, "cx", parseFloat(icon.getAttributeNS( null, "cx" )) + 1.5 );
    plus.setAttributeNS(null, "cy", parseFloat(icon.getAttributeNS( null, "cy" )) - 0.5 );
    plus.setAttributeNS(null, "fill", "url(#plus)");
    plus.classList.add( "tileIconPlus" );
    hide( plus );
    tile.appendChild( plus );
}


/*** UTILITY ***/


function getInitTokenIconId( initToken ) {
    let hexes = [ getHexFromId(initToken.from), getHexFromId(initToken.to) ];
    const fromTileId = hexes.reduce( (f,t) => isInitTokenMasterHex( f, t ) ? f : t ).id;
    const toTileId = hexes.find( h => h.id !== fromTileId ).id;
    return fromTileId + "-" + toTileId + "-token";
}

function isInitTokenMasterHex( fromHex, toHex ) {
    return fromHex.x > toHex.x || ( fromHex.x === toHex.x && fromHex.y > toHex.y );
}

function isImageTile( tileId ) {
    return id(tileId + "-text").style.display === "none";
}

function colorElement( elementId, color, isImage ) {
    if ( color ) {
        id( elementId ).classList.add( color + (isImage ? "Image" : "") );
    }
    else {
        const colorClassList = Array.from( id( elementId ).classList ).filter( cl => COLORS.some( c => cl.includes( c ) ) );
        id( elementId ).classList.remove( ...colorClassList );
    }
}