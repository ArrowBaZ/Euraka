/**
    Charge des fichiers audios ou des images
    Si mp3 -> preloadSound
    Sinon -> preloadImg

    tools.canPlayMP3 détermine si on charge des mp3 ou des ogg

**/
// Data
var config = require( 'data/config.js' );

// Class
var Img = require( 'class/img.js' );
var Sound = require( 'class/sound.js' );

// Lib
var _ = require( 'underscore' );
var tools = require( 'lib/tools.js' );

class Preloader
{
    constructor( game )
    {
        this.game = game;

        this.path = config.paths;
        this.tabGroup = [
            {
                name: 'game',
                files: [
                    new Img( 'ui.png' ),
                    new Img( 'game.png' ),
                    new Img( 'keys.png' ),
                    new Img( 'minimaps/grotte1-1a.png' ),
                    new Img( 'minimaps/grotte1-2a.png' ),
                    new Img( 'minimaps/pyramide2-1a.png' ),
                    new Img( 'minimaps/pyramide2-2a.png' ),
                    new Img( 'minimaps/tuto.png' )
                ]
            },
            {
                name: 'sound',
                files: [
                    new Sound( 'musiques/intro.mp3' ),
                    new Sound( 'musiques/cinematique.mp3' ),
                    new Sound( 'musiques/fin.mp3' ),
                    new Sound( 'musiques/jeu1.mp3' ),
                    new Sound( 'musiques/jeu2.mp3' ),
                    new Sound( 'musiques/jeu3.mp3' ),
                    new Sound( 'musiques/jeu4.mp3' ),
                    new Sound( 'musiques/jeu5.mp3' ),
                    new Sound( 'sons/energie.mp3' ),
                    new Sound( 'sons/enregie-moins.mp3' ),
                    new Sound( 'sons/gameover.mp3' ),
                    new Sound( 'sons/halo.mp3' ),
                    new Sound( 'sons/kickette.mp3' ),
                    new Sound( 'sons/tir.mp3' )
                ]
            }
        ];

        return;
    }

    getAsset( group, file )
    {
        // On trouve le groupe
        var result = _.filter( this.tabGroup, function( o )
        {
            return o.name === group;
        } );

        // On trouve le fichier
        if ( tools.isset( result[ 0 ] ) === true )
        {
            // Si c'est un .mp3
            if ( file.lastIndexOf( '.mp3' ) !== -1 )
            {
                // On check si on doit load un mp3 ou un ogg
                if ( tools.canPlayMP3( new Audio() ) === false )
                {
                    file = file.replace( 'mp3', 'ogg' );
                }
            }

            result = _.filter( result[ 0 ].files, function( o )
            {
                return o.getPath() === file;
            } );

            // On retourne le fichier
            if ( tools.isset( result[ 0 ] ) === true )
            {
                return result[ 0 ];
            }
        }

        return;
    }

    getAssetObjet( group, file )
    {
        var result = this.getAsset( group, file );

        if ( tools.isset( result ) )
        {
            return result.getObj();
        }

        return;
    }

    start()
    {
        var self = this;

        _.each( this.tabGroup, function( group )
        {

            group.total = group.files.length;
            group.count = 0;
            group.percent = 0;

            _.each( group.files, function( file )
            {
                file.preload();
                file.onLoaded( function()
                {
                    self.fileLoaded( group );
                } );
                file.onError( this.handleError );

            }, this );
        }, this );

        this.launchSound();

        return;
    }

    /**
     * Hack Chrome
     * On lance la lecture des sons pour passer du status 206 à 200.
     */
    launchSound()
    {
        var group, sound;

        // On trouve le groupe sound
        group = _.filter( this.tabGroup, function( item )
        {
            return item.name === 'sound';
        } );

        _.each( group[ 0 ].files, function( item )
        {
            item.onError( this.handleError );
        }, this );

        return;
    }

    handleError( e )
    {
        e = e || window.event;

        console.log( 'Error loading: ' + e.target.src );
        if ( tools.isset( e.target.error ) === true )
        {
            switch ( e.target.error.code )
            {
                case e.target.error.MEDIA_ERR_ABORTED:
                    console.log( 'You aborted the media playback.' );
                    break;
                case e.target.error.MEDIA_ERR_NETWORK:
                    console.log( 'A network error caused the media download to fail.' );
                    break;
                case e.target.error.MEDIA_ERR_DECODE:
                    console.log( 'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.' );
                    break;
                case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    console.log( 'The media could not be loaded, either because the server or network failed or because the format is not supported.' );
                    break;
                default:
                    console.log( 'An unknown media error occurred.' );
            }
        }

        return;
    }

    getPercent( group )
    {
        group.percent = Math.min( Math.ceil( group.count * 100 / group.total ), 100 );

        return group.percent;
    }

    fileLoaded( group )
    {
        group.count++;

        return;
    }

}

module.exports = Preloader;