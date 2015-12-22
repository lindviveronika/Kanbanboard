$(document).ready(function(){

  //Load work items
  getWorkItemsDB(displayWorkItems);


  //Add new item
  $('#newItemButton').click(function(){
      displayNewItem({items:{id: '', description: ''}});
      var workItemEl = $('.workItem').last();
      displayEditItemDialog(workItemEl.children('.editItemDialog'), workItemEl.children('.workItemDescription').text());

      workItemEl.find('.saveChangesButton').click(function(){
          var itemDescription = workItemEl.find('.editItemDescription').text();
          addNewItemDB(workItemEl, itemDescription, updateNewItem);
      });

      workItemEl.find('.closeEditDialog').click(function(){
          hideEditItemDialog(workItemEl.children('.editItemDialog'));
          workItemEl.remove();
      })
  });

  //Edit item
  $(document).on('click','.edit',function(){
      var workItem = $(this).parent();

      displayEditItemDialog(workItem.children('.editItemDialog'), workItem.children('.workItemDescription').text());

      workItem.find('.saveChangesButton').click(function(){
          var newDescription = workItem.find('.editItemDescription').text();
          editItemDescriptionDB(workItem, newDescription, hideEditItemDialog);
      });

      workItem.find('.closeEditDialog').click(function(){
          hideEditItemDialog(workItem.children('.editItemDialog'));
      })
  });

  //Delete item
  $(document).on('click','.delete',function(e){
      e.stopPropagation();
      var parent = $(this).parent();

      deleteItemDB(parent, function(item){item.remove()});
  })

  //Make items sortable
  $('.item-container').sortable({
      connectWith: '.item-container',
      revert: true,
      receive: function(event, ui) {
          editItemStageDB(ui.item, getItemId($(this).parent()));
      },
      update: function(event, ui){
          var data = $(this).sortable('serialize');
          if(data != ''){
              editItemSortOrderDB(data);
          }
      }
  });

});

function getItemId(workItem){
  return workItem.attr('id').replace('item-','');
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
  var posting = $.post('php/addNewItem.php', {description: itemDescription, sortOrder: '1', stage: 'toDo'} );
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
          onComplete(workItem.children('.editItemDialog'));
          workItem.children('.workItemDescription').text(newDescription);
      }
  });

  posting.fail(function(){
      alert(errorMessage);
  });
}

function editItemStageDB(workItem, stage){
  var posting = $.post('php/editStage.php', {id: getItemId(workItem), stage: stage});
  var errorMessage = 'Item stage was not updated. Please refresh the page and try again.';

  posting.done(function(response){
      json = errorHandler(response, errorMessage);
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
  $.get('workItemTemplate.html', function(templates) {
      workItemTemplate = $(templates).filter('#workItemTemplate').html();
      $('#toDo').find('.item-container').append(Mustache.render(workItemTemplate, toDoItems));
      $('#inProgress').find('.item-container').append(Mustache.render(workItemTemplate, inProgressItems));
      $('#done').find('.item-container').append(Mustache.render(workItemTemplate, doneItems));

  });
}

function displayNewItem(templateInput){
  $('#toDo').find('.item-container').append(Mustache.render(workItemTemplate, templateInput));
  $('html, body').animate({
    scrollTop: $('.workItem').last().offset().top
  }, 1000);
}

function updateNewItem(item, id, description){
  item.attr('id','item-' + id);
  item.find('.workItemDescription').text(description);
  hideEditItemDialog(item.find('.editItemDialog'));
  $('.item-container').sortable('refresh');
}

function displayEditItemDialog(dialog, currentDescription){
  dialog.show();
  $('.overlay').show();
  $('html, body').animate({
    scrollTop: $(dialog).last().offset().top
  }, 1000);
  dialog.find('.editItemDescription').text(currentDescription);
  dialog.find('.editItemDescription').focus();
  placeCaretAtEnd( dialog.find('.editItemDescription')[0] );
}

function hideEditItemDialog(dialog){
  dialog.hide();
  $('.overlay').hide();
  dialog.find('.saveChangesButton').off('click');
  dialog.find('.loseEditDialog').off('click');
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
