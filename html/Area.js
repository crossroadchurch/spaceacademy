class Area {
    
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
            if(this.action.indexOf('(') != -1){
              if(this.action.indexOf(')') == this.action.length -1){
                var param = this.action.slice(this.action.indexOf('(')+1, this.action.length-1);
                var fname = this.action.slice(0, this.action.indexOf('('));
                var fn = window[fname];
                fn.call(null, param);
              }
            } else {
              var fn = window[this.action];
              fn();
            }
        }
      }
    }