$(document).ready(function(){

  var dragging = false;

  //Swipe right
  $('body').hammer().bind('panleft', function(event){
    if(!dragging){
      var currentPosition = parseFloat($('#slider').css('left'));
      if(currentPosition == 0){
        showColumn('inProgress');
      }
      else if (currentPosition == - $('#slider').width() * 0.855){
        showColumn('done');
      }
    }
  });

  //Swipe left
  $('body').hammer().bind('panright', function(event){
    if(!dragging){
      var currentPosition = parseFloat($('#slider').css('left'));
      if(currentPosition == - $('#slider').width() * 0.855){
        showColumn('toDo');
      }
      else if (currentPosition == - 2 * $('#slider').width() * 0.855) {
        showColumn('inProgress');
      }
    }
  });

  //Show sort item option
  $('body').hammer({domEvents:true}).on('press', '.item', function(){
      var item = $(this);
      console.log('press');
      dragging = true;
      item.addClass('item-dragging');
      $('body').on('touchmove', function(event){
        event.preventDefault();
        if(dragging){
          item.offset({
              top: event.originalEvent.touches[0].pageY
          });
        }
      });

      $('body').on('touchend', function(event){
        dragging = false;
        item.removeClass('item-dragging');
        $('body').off('touchmove');
      });

  });

  //Open edit dialog
  $('.item-container').hammer({domEvents:true}).on('tap', '.item', function(){
    var workItem = $(this);
    displayEditDialog(workItem.children('.edit-dialog'), workItem.children('.description').text());

  });

  $('body').data('hammer').get('pan').set({threshold: 100});

  //Load work items
  getWorkItemsDB(displayWorkItems);


  //Add new item
  $('#newItemButton').click(function(){
      showColumn('toDo');
      displayNewItem({items:{id: '', description: ''}});
      var workItemEl = $('#toDo').find('.item').last();
      displayEditDialog(workItemEl.children('.edit-dialog'), workItemEl.children('.description').text());

      workItemEl.find('.btn-save').click(function(){
          var itemDescription = workItemEl.find('.content-editable').text();
          addNewItemDB(workItemEl, itemDescription, updateNewItem);
      });

      workItemEl.find('.btn-close').click(function(){
          hideEditDialog(workItemEl.children('.edit-dialog'));
          workItemEl.remove();
      })
  });

  //Save changes
  $(document).on('click','.btn-save',function(event){
      event.stopPropagation();
      var workItem = $(this).closest('.item');
      var newDescription = workItem.find('.content-editable').text();
      editItemDescriptionDB(workItem, newDescription, hideEditDialog);
  });

  //Close dialog
  $(document).on('click','.btn-close',function(event){
      event.stopPropagation();
      var workItem = $(this).closest('.item');
      hideEditDialog(workItem.children('.edit-dialog'));
  });

  //Open menu
  $(document).on('click','.btn-menu',function(event){
      event.stopPropagation();
      var menu = $(this).next('ul')
      menu.show();
      $(document).one('click',function(event){
        if(!menu.is(event.target) && menu.has(event.target).length === 0){
          menu.hide();
        }
      });
  });

  //Delete item
  $(document).on('click','.a-delete',function(event){
      event.stopPropagation();
      var workItem = $(this).closest('.item');
      deleteItemDB(workItem, function(item){
        hideEditDialog(workItem.children('.edit-dialog'));
        var container = workItem.closest('.item-container');
        item.remove();
        updateSortOrder(container);
      });
  });

  //Move item to To Do
  $(document).on('click','.move-todo',function(event){
      event.stopPropagation();
      moveItem($(this).closest('.item'), 'toDo');
  });

  //Move item to In Progress
  $(document).on('click','.move-inprogress',function(event){
      event.stopPropagation();
      moveItem($(this).closest('.item'), 'inProgress');
  });

  //Move item to Done
  $(document).on('click','.move-done',function(event){
      event.stopPropagation();
      moveItem($(this).closest('.item'), 'done');
  });

});

function getSortOrder(column){
  return  $('#' + column).find('.item-container').children().length;
}

function getItemId(workItem){
  return workItem.attr('id').replace('item-','');
}

function toIdString(idArray){
  var idString = '';
  idArray.each(function(){
    if(idString != ''){
      idString += '&'
    }
    idString += 'item[]=' + (getItemId($(this)));
  });
  return idString;
}

function errorHandler(response, errorMessage){
  try{
      var json = $.parseJSON(response);
      console.log(json.msg);
      if(json.status == 'success'){
          return json;
      }
      else{
          alert(errorMessage);
      }
  }
  catch(e){
      alert(errorMessage);
  }
}

function getWorkItemsDB(onComplete){
  var get = $.get('php/getAllWorkItems.php');
  var errorMessage = 'Couldn\'t get items from database. Please refresh the page.';

  get.done(function(response){
      json = errorHandler(response, errorMessage);
      if(json != null){
          var templateInput = {items : json.data};
          onComplete(templateInput);
      }
  });

  get.fail(function(){
      alert(errorMessage);
  });
}

function addNewItemDB(workItemEl, itemDescription, onComplete){
  var sortOrder = getSortOrder('toDo') - 1;
  var posting = $.post('php/addNewItem.php', {description: itemDescription, sortOrder: sortOrder, stage: 'toDo'} );
  var errorMessage = 'Item was not added. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
      if(json != null){
          onComplete(workItemEl, json.id, itemDescription);
      }
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function editItemDescriptionDB(workItem, newDescription, onComplete){
  var posting = $.post('php/editDescription.php', {id: getItemId(workItem), description: newDescription});
  var errorMessage = 'Item was not updated. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
      if(json != null){
          onComplete(workItem.children('.edit-dialog'));
          workItem.children('.description').text(newDescription);
      }
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function editItemStageDB(workItem, stage, sortOrder, onComplete){
  var posting = $.post('php/editStage.php', {id: getItemId(workItem), stage: stage, sortOrder: sortOrder});
  var errorMessage = 'Item stage was not updated. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
      onComplete();
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function editItemSortOrderDB(items){
  var posting = $.post('php/editSortOrder.php', items);
  var errorMessage = 'Item sort order was not updated. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function deleteItemDB(workItem, onComplete){
  var posting = $.post('php/deleteItem.php', {id: getItemId(workItem)});
  var errorMessage = 'Item was not deleted. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
      if(json != null){
          onComplete(workItem);
      }
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function showColumn(columnName){
  switch (columnName) {
    case 'toDo':
      $('#slider').css('left', '0px');
      break;
    case 'inProgress':
      $('#slider').css('left', '-' + $('#slider').width() * 0.855 + 'px');
      break;
    case 'done':
    $('#slider').css('left', '-' + 2 * $('#slider').width() * 0.855 + 'px');
    break;
    default:
      $('#slider').css('left', '0px');
  }
}

function displayWorkItems(templateInput){
  var toDoItems = {items: []};
  var inProgressItems = {items: []};;
  var doneItems = {items: []};;

  templateInput.items.forEach(function(item){
      if(item.stage === 'toDo'){
          toDoItems.items.push(item);
      }
      else if(item.stage === 'inProgress'){
          inProgressItems.items.push(item);
      }
      else{
          doneItems.items.push(item);
      }
  });
  $.get('workItemTemplateMobile.html', function(templates) {
      workItemTemplate = $(templates).filter('#workItemTemplate').html();
      $('#toDo').find('.item-container').append(Mustache.render(workItemTemplate, toDoItems));
      $('#inProgress').find('.item-container').append(Mustache.render(workItemTemplate, inProgressItems));
      $('#done').find('.item-container').append(Mustache.render(workItemTemplate, doneItems));

  });
}

function displayNewItem(templateInput){
  $('#toDo').find('.item-container').append(Mustache.render(workItemTemplate, templateInput));
  $('html, body').animate({
    scrollTop: $('.item').last().offset().top
  }, 1000);
}

function updateNewItem(item, id, description){
  item.attr('id','item-' + id);
  item.find('.description').text(description);
  hideEditDialog(item.find('.edit-dialog'));
}

function moveItem(item, toColumn){
  var sortOrder = getSortOrder(toColumn);
  editItemStageDB(item, toColumn, sortOrder, function(){
    hideEditDialog(item.children('.edit-dialog'));
    var prevContainer = item.closest('.item-container');
    $('#' + toColumn).find('.item-container').append(item);
    updateSortOrder(prevContainer);
    showColumn(toColumn);
  });
}

function updateSortOrder(itemContainer){
  var remainingItems = itemContainer.children('.item');
  var itemIds = toIdString(remainingItems);
  if(itemIds.length > 0){
    editItemSortOrderDB(itemIds);
  }
}

function displayEditDialog(dialog, currentDescription){
  dialog.show();
  $('.overlay').show();
  $('html, body').animate({
    scrollTop: $(dialog).last().offset().top
  }, 1000);
  dialog.find('.content-editable').text(currentDescription);
  dialog.find('.content-editable').focus();
  placeCaretAtEnd( dialog.find('.content-editable')[0] );
}

function hideEditDialog(dialog){
  dialog.hide();
  $('.overlay').hide();
}

//Taken from http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
          && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
  }
}
