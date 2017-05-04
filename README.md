# react-component-animate-array-state-change

Implementation of the FLIP method.

Applying css transitions to a list of elements in React has no effect when the element positions shift within that list.

To apply animations, we use the FLIP method. There are a few knowns needed:
1. Positions of the elements before
2. Positions of the elements after

How the FLIP method works:
1. Get position of elements prior to position change
2. Move the elements. Call layout.
3. Prior to paint, shift all the elements back to their original positions. Use a transform.
4. After paint, and prior to the next repaint, remove the transform and apply a transition.
