import React from 'react';

function FacebookFeed() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '340px',
        height: 'calc(100% + 130px)',
        marginTop: '-130px',
        paddingTop: '175px',
        overflow: 'hidden',
      }}>
        <iframe
          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fmetrocebuwater&tabs=timeline&width=340&height=800&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false&appId"
          width="100%"
          height="800"
          style={{ border: 'none', display: 'block', marginTop: '-130px' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      </div>
    </div>
  )
}

export default FacebookFeed;