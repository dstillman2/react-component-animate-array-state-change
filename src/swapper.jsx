import React, { Component } from 'react';
import ReactDOM from 'react-dom';


/*
 * When there is a state change for an array of nodes, React determines which
 * nodes to keep, create, or destroy. The changes are instant and css transitions
 * have no effect.
 *
 * In order to apply css transitions for a smooth transform, we must know the
 * position of the element in its before state and its after state. From these
 * two states, the change in top and left positions can be calculated.
 *
 * Right after the browser updates the layout and before the repaint
 * (componentDidUpdate in React), we get the after coordinates of the elements in
 * its new state and use a transform to move them back to their original location.
 * From here, we can apply a css transition that makes it look like the element
 * moved when in fact it's already at its new location.
 */


class Swap extends Component {

  componentWillReceiveProps(nextProps) {
    if (this.domNodes) {
      // In case an animation is already in progress, stop the animation in place
      // to recalculate the new position.
      for (let i = 0; i < this.domNodes.length; i++) {
        this.domNodes[i].style.transition = '';
      }
    }

    this.changedNodes = (
      task.getChangedNodes(this.props.children, nextProps.children)
    );

    if (Object.keys(this.changedNodes).length < 1) {
      // No elements have been changed. Complete the lifecycle.
      return;
    }

    this.updateFlag = true;

    for (let key in this.changedNodes) {
      const dom = ReactDOM.findDOMNode(this.refs[key]);

      this.changedNodes[key].oldPosition = task.getPosition(dom);
    }
  }


  componentDidUpdate() {
    if (this.updateFlag && window.requestAnimationFrame) {
      this.domNodes = [];

      for (let key in this.changedNodes) {
        const dom = ReactDOM.findDOMNode(this.refs[key]);

        const {dX, dY} = (
          task.computeTranslateXYDelta(
            this.changedNodes[key].oldPosition,
            task.getPosition(dom)
          )
        );

        dom.style.transform = `translate(${dX}px, ${dY}px)`;

        this.domNodes.push(dom);
      }

      window.requestAnimationFrame(() => {
        // Function is called before the next repaint
        window.requestAnimationFrame(() => {
          // Animate next frame after the repaint
          this.domNodes.forEach(el => {
            el.style.transition = this.props.transition;
            el.style.transform = '';

            function handler() {
              el.style.transition = '';

              el.removeEventListener('transitionend', handler);
            }

            el.addEventListener('transitionend', handler);
          });
        });
      });

      this.updateFlag = false;
    }
  }


  render() {
    return (
      <div ref={c => this.parent = c}>
        {task.addRefToChildren(this.props.children)}
      </div>
    );
  }

}


const task = {

  addRefToChildren(children) {
    // Clone the element. Note that the key is automatically set to a new key
    // to prevent duplication of keys. The original key value is stored as a ref,
    // and this ref is also used to select the DOM node. Must be used inside
    // render function.
    return (
      React.Children.map(children, element => {
        return (
          React.cloneElement(element, {ref: element.key})
        );
      })
    );
  },


  getChangedNodes(currentChildren, nextChildren) {
    // Returns an object with key references to elements that have changed
    // index positions in the array.
    const hash = {};

    const currentOrdering = this._getChildrenKeys(currentChildren);
    const nextOrdering = this._getChildrenKeys(nextChildren);

    for (let i = 0; i < nextOrdering.length; i++) {
      if (
        nextOrdering[i] !== currentOrdering[i] &&
        currentOrdering.indexOf(nextOrdering[i]) !== -1) {
        // Only add in the elements that currently exist and have changed
        // positions.
        hash[nextOrdering[i]] = {};
      }
    }

    return hash;
  },


  computeTranslateXYDelta(positionBefore, positionAfter) {
    return {
      dX: positionBefore.left - positionAfter.left,
      dY: positionBefore.top - positionAfter.top
    };
  },


  getPosition(node) {
    // Returns the top, right, bottom, left, width, height of the element relative
    // to the viewport.
    return node.getBoundingClientRect();
  },


  _getChildrenKeys(children) {
    // Takes an array or element of children and returns the element key.
    return React.Children.map(children, (element) => {
      return element.key;
    });
  }

};


Swap.defaultProps = {
  children: [],

  transition: 'transform 0.5s ease 0s'
};


export default Swap;
