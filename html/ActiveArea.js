class ActiveArea {
    
      constructor(x, y, w, h, c, action) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.color = c;
        this.action = action;
      }
      
      show() {
        fill(this.color);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
      }

      detectClick(mX, mY) {
        if(mX >= this.x && mX <= (this.x + this.width) &&
           mY >= this.y && mY <= (this.y + this.height)){
            var fn = window[this.action];
            fn();
        }
      }
    }